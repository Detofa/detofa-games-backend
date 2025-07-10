/*
  Warnings:

  - Added the required column `pointprice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pointprice" INTEGER NOT NULL;
