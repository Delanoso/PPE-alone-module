# Core Process Workflows

## 1. User Registration and Login

```mermaid
flowchart TD
    A[Admin creates user account] --> B[User receives activation link]
    B --> C[User sets password]
    C --> D[User logs in]
    D --> E{Valid credentials?}
    E -->|No| F[Show error and count attempt]
    E -->|Yes| G[Load role dashboard]
```

## 2. People Management

```mermaid
flowchart TD
    A[Open People Module] --> B[Click Add Person]
    B --> C[Capture identity and contact data]
    C --> D[Select department and sub-department]
    D --> E[Capture PPE sizes]
    E --> F[Save person]
    F --> G[Person appears in list]
    G --> H[Edit sizes or details]
    G --> I[Delete person - soft delete]
```

## 3. Stock Intake and Control

```mermaid
flowchart TD
    A[Goods received] --> B[Capture receipt]
    B --> C[Select PPE item and size]
    C --> D[Enter quantity and reference]
    D --> E[Post movement]
    E --> F[Update on-hand and available]
    F --> G{Below threshold?}
    G -->|Yes| H[Create low-stock alert]
    G -->|No| I[End]
```

## 4. PPE Issue with WhatsApp Signature

```mermaid
flowchart TD
    A[Create issue transaction] --> B[Add person and items]
    B --> C[Validate available stock]
    C --> D[Reserve and post issue]
    D --> E{Signature mode}
    E -->|In person| F[Capture on-screen signature]
    E -->|Remote| G[Generate signed token link]
    G --> H[Send WhatsApp message]
    H --> I[Worker opens link]
    I --> J[Review issued items]
    J --> K[Worker signs digitally]
    K --> L[Store signature and timestamp]
    F --> L
    L --> M[Mark issue as signed]
```

## 5. Exception Handling

- If stock validation fails: issue remains in draft, user must change quantity/item.
- If WhatsApp send fails: retry queue with exponential backoff.
- If link expires: authorized user can resend a new link.
- If person is deleted: issue history remains immutable and reportable.
