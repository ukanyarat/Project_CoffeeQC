import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: '#8D6E63', // Main brown color for buttons, links, etc.
    colorInfo: '#8D6E63',
    colorSuccess: '#66BB6A',
    colorWarning: '#FFA726',
    colorError: '#EF5350',
    
    // Backgrounds
    colorBgBase: '#FFFFFF',      // Base background for components like Modal, Popover
    colorBgLayout: '#F9F6F2',    // Main layout background color
    colorBgContainer: '#FFFFFF', // Default background for components like Card, Table

    // Typography
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',

    // Sizing
    borderRadius: 8,
    controlHeight: 40,
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#F9F6F2',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: '#5D4037',
      itemHoverBg: '#F5F5F5',
      itemSelectedBg: '#EFEBE9',
      itemSelectedColor: '#4E342E',
      subMenuItemBg: '#FFFFFF',
      activeBarBorderWidth: 0,
    },
    Card: {
      headerBg: 'transparent',
      borderRadiusLG: 12,
      paddingLG: 24,
    },
    Button: {
      primaryShadow: 'none',
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#4E342E',
      headerSortHoverBg: '#F0F0F0',
      headerSortActiveBg: '#EAEAEA',
    },
    Input: {
      controlHeight: 40,
    },
    Select: {
      controlHeight: 40,
    },
    DatePicker: {
      controlHeight: 40,
    },
  },
};

export default theme;
