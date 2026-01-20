-- CreateTable
CREATE TABLE "PaymentQR" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "qr_code" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "order_id" UUID NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentQR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentQR_qr_code_key" ON "PaymentQR"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentQR_order_id_key" ON "PaymentQR"("order_id");

-- CreateIndex
CREATE INDEX "PaymentQR_company_id_idx" ON "PaymentQR"("company_id");

-- CreateIndex
CREATE INDEX "PaymentQR_order_id_idx" ON "PaymentQR"("order_id");

-- AddForeignKey
ALTER TABLE "PaymentQR" ADD CONSTRAINT "PaymentQR_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentQR" ADD CONSTRAINT "PaymentQR_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentQR" ADD CONSTRAINT "PaymentQR_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentQR" ADD CONSTRAINT "PaymentQR_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
