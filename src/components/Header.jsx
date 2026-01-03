import { WiDaySunny } from 'react-icons/wi';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WiDaySunny className="text-3xl text-blue-500" />
            <h1 className="text-xl font-normal text-gray-700">
              Weather
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

