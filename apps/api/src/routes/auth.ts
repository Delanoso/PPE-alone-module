import type { FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createAuditLog } from "../lib/audit.js";

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(10),
  roleCode: z.string().min(3).default("storeman"),
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const payload = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (existing) {
      return reply.conflict("Email address already exists");
    }

    const role = await prisma.role.findUnique({
      where: { roleCode: payload.roleCode },
    });

    if (!role) {
      return reply.badRequest("Role not found");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await prisma.user.create({
      data: {
        roleId: role.id,
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        passwordHash,
      },
      include: {
        role: true,
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      action: "register",
      entityName: "user",
      entityId: user.id,
      afterJson: { email: user.email, roleCode: user.role.roleCode },
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"]?.toString(),
    });

    return reply.code(201).send({
      success: true,
      message: "User registered",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleCode: user.role.roleCode,
      },
    });
  });

  app.post("/login", { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } }, async (request, reply) => {
    const payload = loginSchema.parse(request.body);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.username.toLowerCase() }, { employeeNo: payload.username }],
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return reply.unauthorized("Invalid credentials");
    }

    if (!user.isActive || user.deletedAt) {
      return reply.forbidden("Account inactive");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return reply.forbidden("Account locked. Please try again later");
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts >= 5 ? 0 : failedAttempts,
          lockedUntil: lockUntil,
        },
      });
      return reply.unauthorized("Invalid credentials");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const accessToken = app.jwt.sign(
      {
        userId: user.id,
        roleCode: user.role.roleCode,
        email: user.email,
      },
      { expiresIn: "15m" },
    );

    const refreshToken = app.jwt.sign(
      {
        userId: user.id,
        type: "refresh",
      },
      { expiresIn: "14d" },
    );

    await createAuditLog({
      actorUserId: user.id,
      action: "login",
      entityName: "user",
      entityId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"]?.toString(),
    });

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleCode: user.role.roleCode,
        },
      },
    };
  });

  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        include: { role: true },
      });
      if (!user) {
        throw app.httpErrors.notFound("User not found");
      }
      return {
        success: true,
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleCode: user.role.roleCode,
        },
      };
    },
  );
};
