import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard brand and main tabs', () => {
  render(<App />);
  expect(screen.getByText(/NYC Crime Breakdown/i)).toBeInTheDocument();
  expect(screen.getByText(/^Headlines$/i)).toBeInTheDocument();
  expect(screen.getByText(/^Crime Numbers$/i)).toBeInTheDocument();
  expect(screen.getByText(/^By Precinct$/i)).toBeInTheDocument();
  expect(screen.getByText(/^By Council District$/i)).toBeInTheDocument();
});
