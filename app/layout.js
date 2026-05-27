import './globals.css';

export const metadata = {
  title: 'PikaThrift: Ocean Cleanup Thrift',
  description: 'Student-run non-profit aligned with UN SDG Goal 12: Responsible Consumption and Production. We collect textile waste from beaches, wash and sort it, then sell clean clothing cheaply to thrift shops.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
