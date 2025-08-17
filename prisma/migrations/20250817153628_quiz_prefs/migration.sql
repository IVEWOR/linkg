-- CreateTable
CREATE TABLE "public"."quiz_preferences" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_preferences_user_id_key" ON "public"."quiz_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "public"."quiz_preferences" ADD CONSTRAINT "quiz_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
