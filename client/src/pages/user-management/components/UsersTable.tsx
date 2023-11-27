import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type UserInterface from '@src/types/interfaces/user';
import convertToTitleCase from '@src/utils/convertToTitleCase';
import RoleEnum from '@src/types/enums/role-enum';

interface UsersTableProps {
  users: UserInterface[];
}

// TODO: IAN - MAKE EMAIL ROW OPEN MODAL FOR EACH USER
const UsersTable = ({ users }: UsersTableProps): JSX.Element => {
  const columns: ColumnsType<UserInterface> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (_, record) => <a>{record.email}</a>,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (_, record) => {
        if (!record.roles.length) return <p>No roles</p>;

        return (
          <p>
            {record.roles.map((role) => (
              <Tag
                key={role.name}
                color={
                  role.name === RoleEnum.CISCO_ADMIN
                    ? 'error'
                    : role.name === RoleEnum.CISCO_MEMBER
                    ? 'processing'
                    : 'success'
                }
              >
                {convertToTitleCase(role.name)}
              </Tag>
            ))}
          </p>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      pagination={{
        pageSize: 10,
        total: users.length,
      }}
      rowKey="email"
    />
  );
};

export default UsersTable;
