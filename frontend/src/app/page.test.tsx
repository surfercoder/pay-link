import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the header with correct text', () => {
    render(<Home />);
    const headerText = screen.getByText('Pay Link');
    expect(headerText).toBeInTheDocument();
  });

  it('renders the PaymentForm component', () => {
    const { container } = render(<Home />);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement?.children.length).toBeGreaterThan(0);
  });

  it('has the correct layout structure', () => {
    const { container } = render(<Home />);
    const header = container.querySelector('header');
    const main = container.querySelector('main');

    expect(header).toHaveClass('bg-white shadow-sm');
    expect(main).toHaveClass('max-w-7xl mx-auto py-6 sm:px-6 lg:px-8');
  });
});