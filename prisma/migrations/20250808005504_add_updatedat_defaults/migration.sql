-- AlterTable
ALTER TABLE "public"."Item" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."UserStackItem" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
