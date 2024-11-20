import type { NextPage } from 'next';
import EquityCalculator from '../components/EquityCalculator';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <EquityCalculator />
    </div>
  );
};

export default Home;