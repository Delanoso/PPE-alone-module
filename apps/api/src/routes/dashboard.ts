import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/dashboard/summary",
    {
      preHandler: [app.authenticate],
    },
    async () => {
      const [activeWorkers, openIssues, pendingSignatures, lowStockVariants] = await Promise.all([
        prisma.person.count({
          where: {
            deletedAt: null,
            employmentStatus: "active",
          },
        }),
        prisma.issueTransaction.count({
          where: {
            issueStatus: {
              in: ["draft", "pending_signature"],
            },
          },
        }),
        prisma.issueTransaction.count({
          where: {
            issueStatus: "pending_signature",
          },
        }),
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM (
            SELECT sm."ppeVariantId", SUM(sm.quantity) AS balance, pv."minStockLevel"
            FROM "StockMovement" sm
            JOIN "PpeVariant" pv ON pv.id = sm."ppeVariantId"
            GROUP BY sm."ppeVariantId", pv."minStockLevel"
            HAVING SUM(sm.quantity) < pv."minStockLevel"
          ) as low_stock
        `,
      ]);

      return {
        success: true,
        data: {
          activeWorkers,
          openIssues,
          pendingSignatures,
          lowStockItems: Number(lowStockVariants[0]?.count ?? 0),
        },
      };
    },
  );
};
