/*
  Warnings:

  - The primary key for the `Item` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Item` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followersCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isProfilePublic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `StackItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title,url,category]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `category` on table `Item` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('NORMAL', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Item" DROP CONSTRAINT "Item_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StackItem" DROP CONSTRAINT "StackItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StackItem" DROP CONSTRAINT "StackItem_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Item" DROP CONSTRAINT "Item_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "image",
DROP COLUMN "link",
DROP COLUMN "ownerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "category" SET NOT NULL,
ADD CONSTRAINT "Item_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "avatar",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "followersCount",
DROP COLUMN "isProfilePublic",
DROP COLUMN "role",
DROP COLUMN "socialLinks",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description_short" TEXT,
ADD COLUMN     "followers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_profile_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "social_links" JSONB,
ADD COLUMN     "type" "public"."UserType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."StackItem";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."UserStackItem" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "origin_item_id" UUID,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "image_url" TEXT,
    "category" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStackItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserStackItem_userId_idx" ON "public"."UserStackItem"("userId");

-- CreateIndex
CREATE INDEX "UserStackItem_origin_item_id_idx" ON "public"."UserStackItem"("origin_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserStackItem_userId_position_key" ON "public"."UserStackItem"("userId", "position");

-- CreateIndex
CREATE INDEX "Item_category_idx" ON "public"."Item"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Item_title_url_category_key" ON "public"."Item"("title", "url", "category");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."UserStackItem" ADD CONSTRAINT "UserStackItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserStackItem" ADD CONSTRAINT "UserStackItem_origin_item_id_fkey" FOREIGN KEY ("origin_item_id") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
