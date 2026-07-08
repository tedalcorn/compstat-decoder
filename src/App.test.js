import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard brand and main tabs', () => {
  render(<App />);
  expect(screen.getByText(/NYC CompStat Decoder/i)).toBeInTheDocument();
  expect(screen.getByText(/^Crime Types$/i)).toBeInTheDocument();
  expect(screen.getByText(/^By Precinct$/i)).toBeInTheDocument();
  expect(screen.getByText(/^By Council District$/i)).toBeInTheDocument();
});
