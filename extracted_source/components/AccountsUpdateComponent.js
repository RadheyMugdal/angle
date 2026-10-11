import { AccountsUpdateModal } from '@teuteuf-games/accounts-update-modal';
import useUser from '../hooks/useUser';

const AccountsUpdateComponent = () => {
  const { showAccountsUpdateModal } = useUser();

  return (
    <div className="text-start">
      <AccountsUpdateModal show={showAccountsUpdateModal} loggedIn={false} />
    </div>
  );
};

export default AccountsUpdateComponent;
