import { render as rtlRender, screen } from '@testing-library/react';
import RootLayout from './layout';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui, {
    container: document.documentElement,
  });
};

jest.mock('next/font/google', () => ({
  Geist: () => ({
    className: 'mock-geist-sans',
    variable: '--font-geist-sans',
    style: { fontFamily: 'var(--font-geist-sans)' },
  }),
  Geist_Mono: () => ({
    className: 'mock-geist-mono',
    variable: '--font-geist-mono',
    style: { fontFamily: 'var(--font-geist-mono)' },
  }),
}));

describe('RootLayout', () => {
  const mockChildren = <div data-testid="mock-children">Test Content</div>;

  it('renders children correctly', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    const childrenElement = screen.getByTestId('mock-children');
    expect(childrenElement).toBeInTheDocument();
    expect(childrenElement).toHaveTextContent('Test Content');
  });

  it('has correct HTML structure', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    const html = document.documentElement;
    const body = document.body;

    expect(html).toHaveAttribute('lang', 'en');
    expect(body.className).toContain('mock-geist-sans');
    expect(body.className).toContain('mock-geist-mono');
    expect(body.className).toContain('antialiased');
  });

  it('applies font variables correctly', () => {
    render(<RootLayout>{mockChildren}</RootLayout>);
    const bodyClasses = document.body.className;

    expect(bodyClasses).toContain('mock-geist-sans');
    expect(bodyClasses).toContain('mock-geist-mono');
  });
});