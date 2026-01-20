import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, message, Spin, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CoffeeOutlined } from '@ant-design/icons';
import { sendChatMessage } from '../../api/ai';
import ReactMarkdown from 'react-markdown';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Define ChatMessage type locally
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

    // Add user message to UI
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: userMessage,
        conversationHistory: conversationHistory,
      });

      if (response.success && response.responseObject) {
        // Add AI response to UI
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.responseObject.response },
        ]);

        // Update conversation history
        setConversationHistory(response.responseObject.conversationHistory);
      } else {
        message.error(response.message || 'Failed to get response');
      }
    } catch (error: any) {
      message.error(error.message || 'Error sending message');
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
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            marginBottom: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RobotOutlined style={{ fontSize: '32px', color: '#fff' }} />
            <div>
              <Title level={3} style={{ margin: 0, color: '#fff' }}>
                AI Assistant
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                ถามคำถามเกี่ยวกับข้อมูลร้านได้เลย
              </Text>
            </div>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card
          bordered={false}
          style={{
            height: 'calc(100vh - 340px)',
            overflowY: 'auto',
            marginBottom: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <RobotOutlined style={{ fontSize: '64px', marginBottom: '16px', color: '#ddd' }} />
              <div style={{ fontSize: '18px', marginBottom: '24px' }}>
                สวัสดีค่ะ! ถามคำถามเกี่ยวกับร้านได้เลย
              </div>

              {/* Suggested Questions */}
              <div style={{ marginTop: '24px' }}>
                <Text strong style={{ fontSize: '14px', color: '#666' }}>
                  ลองถามคำถามเหล่านี้:
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      size="small"
                      onClick={() => {
                        setInputMessage(question);
                      }}
                      style={{
                        borderRadius: '16px',
                        background: '#f5f5f5',
                        border: 'none',
                        color: '#666',
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <Avatar
                      icon={<RobotOutlined />}
                      style={{ background: '#667eea', flexShrink: 0 }}
                    />
                  )}

                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: msg.role === 'user' ? '#1890ff' : '#f5f5f5',
                      color: msg.role === 'user' ? '#fff' : '#000',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <div style={{ marginBottom: '8px' }}>{children}</div>,
                          ul: ({ children }) => <ul style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ol>,
                          li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                          code: ({ children }) => (
                            <code style={{
                              background: '#e8e8e8',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '13px',
                            }}>{children}</code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <Text style={{ color: 'inherit' }}>{msg.content}</Text>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ background: '#1890ff', flexShrink: 0 }}
                    />
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Avatar
                    icon={<RobotOutlined />}
                    style={{ background: '#667eea', flexShrink: 0 }}
                  />
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#f5f5f5',
                    }}
                  >
                    <Spin size="small" /> <Text type="secondary">กำลังคิด...</Text>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </Space>
          )}
        </Card>

        {/* Input Area */}
        <Card
          bordered={false}
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์คำถามของคุณ... (Shift+Enter เพื่อขึ้นบรรทัดใหม่, Enter เพื่อส่ง)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{ borderRadius: '8px 0 0 8px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              disabled={!inputMessage.trim()}
              style={{
                height: 'auto',
                borderRadius: '0 8px 8px 0',
                paddingLeft: '24px',
                paddingRight: '24px',
              }}
            >
              ส่ง
            </Button>
          </Space.Compact>
        </Card>
      </div>
    </div>
  );
};

export default AiChatPage;
