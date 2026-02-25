// src/components/layout/Footer.js
import React from 'react';
import { APP_NAME, RT_NAME } from '../../config/constants';

const Footer = () => (
  <footer
    style={{
      textAlign: 'center',
      padding: '12px',
      fontSize: '0.7rem',
      color: 'var(--abu-400)',
      borderTop: '1px solid var(--abu-100)',
      background: '#fff',
    }}
  >
    © {new Date().getFullYear()} {APP_NAME} · {RT_NAME}
  </footer>
);

export default Footer;