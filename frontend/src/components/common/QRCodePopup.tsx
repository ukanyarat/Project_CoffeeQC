import React from "react";
import { Button, Typography, Statistic } from 'antd';

const { Title, Text } = Typography;

interface QRCodePopupProps {
  amount: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const QRCodePopup: React.FC<QRCodePopupProps> = ({ amount, onClose, onPaymentSuccess }) => {
  const promptpayId = "0918168125";
  // Use toFixed(2) to ensure the amount is in the correct format for the QR code generator
  const qrCodeUrl = `https://promptpay.io/${promptpayId}/${amount.toFixed(2)}`;

  return (
    // Full-screen overlay
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Popup content */}
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-96 text-center relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <Title level={3} className="text-brand-text-primary mb-4">
          แสกนจ่าย
        </Title>
        <div className="p-2 bg-white inline-block rounded-lg border-4 border-gray-100">
          <img
            src={qrCodeUrl}
            alt="PromptPay QR Code"
            className="w-64 h-64 mx-auto"
          />
        </div>
        <div className="mt-4">
          <Statistic
            title={<Text style={{ fontSize: 16 }}>ยอดรวมทั้งหมด</Text>}
            value={amount}
            precision={2}
            suffix="บาท"
            valueStyle={{ fontSize: 28, color: '#8D6E63' }}
          />
        </div>
        <Text type="secondary" className="mt-1 block">
          หมายเลขพร้อมเพย์ : {promptpayId}
        </Text>
        <div className="mt-8 space-y-3">
          <Button
            type="primary"
            size="large"
            className="w-full"
            onClick={onPaymentSuccess}
          >
            ฉันได้ชำระเงินแล้ว / ยืนยันคำสั่งซื้อ
          </Button>
          <Button
            size="large"
            className="w-full"
            onClick={onClose}
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePopup;
