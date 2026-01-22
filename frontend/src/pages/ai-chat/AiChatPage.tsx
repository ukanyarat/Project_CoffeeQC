import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, message, Spin, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CoffeeOutlined, BulbOutlined } from '@ant-design/icons';
import { sendChatMessage } from '../../api/ai';
import ReactMarkdown from 'react-markdown';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AiChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: userMessage,
        conversationHistory: conversationHistory,
      });

      if (response.success && response.responseObject) {
        const responseData = response.responseObject;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: responseData.response },
        ]);
        setConversationHistory(responseData.conversationHistory);
      } else {
        message.error(response.message || 'ไม่สามารถรับคำตอบได้');
      }
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'วันนี้มียอดขายเท่าไหร่?',
    'เมนูไหนขายดีที่สุด?',
    'แสดงออเดอร์ทั้งหมดของวันนี้',
    'หาลูกค้าชื่อ สมชาย',
  ];

  return (
    <div className="p-4 md:p-6 bg-coffee-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card
          className="!rounded-2xl !shadow-coffee-md !mb-6"
          styles={{ body: { padding: '20px 24px' } }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-coffee-gradient flex items-center justify-center shadow-coffee-md">
              <RobotOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Title level={2} className="!mb-0 !text-coffee-espresso">
                AI Assistant
              </Title>
              <Text className="text-brand-text-secondary">
                ถามคำถามเกี่ยวกับข้อมูลร้านได้เลย
              </Text>
            </div>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card
          className="!rounded-2xl !shadow-coffee-md !mb-4"
          styles={{
            body: {
              height: 'calc(100vh - 380px)',
              minHeight: '400px',
              overflowY: 'auto',
              padding: '24px',
            },
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-coffee-latte flex items-center justify-center mb-6">
                <CoffeeOutlined className="text-5xl text-coffee-crema" />
              </div>
              <Title level={4} className="!text-coffee-espresso !mb-2">
                สวัสดีค่ะ!
              </Title>
              <Text className="text-brand-text-secondary mb-8 max-w-md">
                ฉันคือ AI Assistant พร้อมช่วยตอบคำถามเกี่ยวกับข้อมูลร้านกาแฟของคุณ
              </Text>

              {/* Suggested Questions */}
              <div className="mt-4 w-full max-w-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BulbOutlined className="text-coffee-caramel" />
                  <Text strong className="text-coffee-dark-roast text-sm">
                    ลองถามคำถามเหล่านี้:
                  </Text>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="!rounded-full !border-coffee-crema !text-coffee-dark-roast hover:!bg-coffee-latte hover:!border-coffee-medium-roast"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Space direction="vertical" size="large" className="w-full">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar
                      icon={<RobotOutlined />}
                      size={40}
                      className="flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6F4E37 0%, #8B6914 100%)' }}
                    />
                  )}

                  <div
                    className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
                    style={{ maxWidth: '75%' }}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <div className="mb-2 last:mb-0">{children}</div>,
                          ul: ({ children }) => <ul className="ml-5 mb-2 list-disc">{children}</ul>,
                          ol: ({ children }) => <ol className="ml-5 mb-2 list-decimal">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          code: ({ children }) => (
                            <code className="bg-white/20 px-2 py-0.5 rounded text-sm">{children}</code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <Text className="text-white">{msg.content}</Text>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <Avatar
                      icon={<UserOutlined />}
                      size={40}
                      className="flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6F4E37 0%, #8B6914 100%)' }}
                    />
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <Avatar
                    icon={<RobotOutlined />}
                    size={40}
                    className="flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6F4E37 0%, #8B6914 100%)' }}
                  />
                  <div className="chat-bubble chat-bubble-assistant">
                    <div className="flex items-center gap-2">
                      <Spin size="small" />
                      <Text className="text-brand-text-secondary">กำลังคิด...</Text>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </Space>
          )}
        </Card>

        {/* Input Area */}
        <Card
          className="!rounded-2xl !shadow-coffee-md"
          styles={{ body: { padding: '16px 20px' } }}
        >
          <div className="flex gap-3">
            <TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์คำถามของคุณ... (Enter เพื่อส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              className="!rounded-xl !border-brand-border"
              size="large"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              disabled={!inputMessage.trim()}
              className="!h-auto !px-6 !rounded-xl"
              style={{
                background: inputMessage.trim()
                  ? 'linear-gradient(135deg, #6F4E37 0%, #5C4030 100%)'
                  : undefined,
              }}
            >
              ส่ง
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AiChatPage;
