import Header from './components/Header';
import TableContainer from './components/TableContainer';

const UserManagementPage = (): JSX.Element => {
  return (
    <div className="flex flex-col h-fit bg-[#f5f5f5]">
      <Header />
      <div className="flex flex-col items-start justify-center h-full gap-5 py-8">
        <TableContainer />
      </div>
    </div>
  );
};

export default UserManagementPage;
