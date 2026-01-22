import type { ThemeConfig } from 'antd';

// Coffee Shop POS Theme - Modern & Professional
const theme: ThemeConfig = {
  token: {
    // Primary Colors - Rich Coffee Tones
    colorPrimary: '#6F4E37', // Deep coffee brown
    colorInfo: '#8B7355', // Mocha
    colorSuccess: '#2E7D32', // Forest green
    colorWarning: '#F59E0B', // Warm amber
    colorError: '#DC2626', // Ruby red

    // Backgrounds - Warm & Inviting
    colorBgBase: '#FFFFFF',
    colorBgLayout: '#FAF7F2', // Warm cream
    colorBgContainer: '#FFFFFF',

    // Typography - Clean & Readable
    fontFamily: `'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    fontSize: 14,
    colorText: '#2D2A26', // Dark espresso
    colorTextSecondary: '#5C5650', // Medium roast
    colorTextTertiary: '#8B8580', // Light roast

    // Sizing & Spacing
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    controlHeight: 44,
    controlHeightLG: 52,
    controlHeightSM: 36,

    // Shadows & Effects
    boxShadow: '0 2px 8px rgba(111, 78, 55, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(111, 78, 55, 0.12)',
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#FAF7F2',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: '#5C5650',
      itemHoverBg: 'rgba(111, 78, 55, 0.06)',
      itemHoverColor: '#6F4E37',
      itemSelectedBg: 'linear-gradient(135deg, #6F4E37 0%, #8B6914 100%)',
      itemSelectedColor: '#FFFFFF',
      subMenuItemBg: '#FFFFFF',
      activeBarBorderWidth: 0,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      iconSize: 18,
      itemHeight: 48,
    },
    Card: {
      headerBg: 'transparent',
      borderRadiusLG: 16,
      paddingLG: 24,
      boxShadowTertiary: '0 2px 12px rgba(111, 78, 55, 0.06)',
    },
    Button: {
      primaryShadow: '0 2px 8px rgba(111, 78, 55, 0.25)',
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      fontWeight: 600,
      borderRadius: 10,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
    },
    Table: {
      headerBg: '#F8F5F0',
      headerColor: '#2D2A26',
      headerSortHoverBg: '#F0EBE4',
      headerSortActiveBg: '#E8E2D9',
      rowHoverBg: 'rgba(111, 78, 55, 0.04)',
      borderColor: '#E8E2D9',
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    Input: {
      controlHeight: 44,
      borderRadius: 10,
      activeBorderColor: '#6F4E37',
      hoverBorderColor: '#8B7355',
    },
    Select: {
      controlHeight: 44,
      borderRadius: 10,
    },
    DatePicker: {
      controlHeight: 44,
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 20,
      paddingLG: 24,
      headerBg: 'transparent',
    },
    Tabs: {
      inkBarColor: '#6F4E37',
      itemActiveColor: '#6F4E37',
      itemHoverColor: '#8B7355',
      itemSelectedColor: '#6F4E37',
      titleFontSize: 15,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Badge: {
      dotSize: 8,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28,
    },
    Divider: {
      colorSplit: '#E8E2D9',
    },
    Collapse: {
      headerBg: '#F8F5F0',
      borderRadiusLG: 12,
    },
    Spin: {
      colorPrimary: '#6F4E37',
    },
    Message: {
      contentBg: '#FFFFFF',
    },
    Notification: {
      borderRadiusLG: 12,
    },
  },
};

export default theme;

// Color Palette for reference
export const coffeeColors = {
  // Primary Palette
  espresso: '#2D2A26',
  darkRoast: '#4A3C31',
  mediumRoast: '#6F4E37',
  lightRoast: '#8B7355',
  crema: '#D4B896',

  // Accent Colors
  caramel: '#C68E17',
  honey: '#F59E0B',
  mint: '#10B981',
  berry: '#EC4899',

  // Neutral Colors
  cream: '#FAF7F2',
  latte: '#F8F5F0',
  milk: '#FFFFFF',

  // Status Colors
  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#0EA5E9',
};
