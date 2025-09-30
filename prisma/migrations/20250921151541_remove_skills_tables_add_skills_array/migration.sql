/*
  Warnings:

  - You are about to drop the `JobSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."JobSkill" DROP CONSTRAINT "JobSkill_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobSkill" DROP CONSTRAINT "JobSkill_skillId_fkey";

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "skills" TEXT[];

-- DropTable
DROP TABLE "public"."JobSkill";

-- DropTable
DROP TABLE "public"."Skill";
