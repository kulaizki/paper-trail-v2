import { AuthContext } from '@src/context/AuthContext';
import { DocumentContext } from '@src/context/DocumentContext';
import { ToastContext } from '@src/context/ToastContext';
import DocumentService from '@src/services/document-service';
import SocketEvent from '@src/types/enums/socket-events';
import StatusEnum from '@src/types/enums/status-enum';
import { Typography, Button, Select } from 'antd';
import { useContext, useEffect, useState } from 'react';

// Filter `option.label` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }): boolean =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const statusToOptionMapping = {
  [StatusEnum.CHANGES_REQUESTED]: 'Changes Requested',
  [StatusEnum.DRAFT]: 'Draft',
  [StatusEnum.RAISED]: 'Raised',
  [StatusEnum.RESOLVED]: 'Resolved',
  [StatusEnum.REVIEW]: 'Review',
  [StatusEnum.REVIEW_REQUESTED]: 'Review Requested',
};

const disabledOptions = [StatusEnum.DRAFT, StatusEnum.REVIEW, StatusEnum.REVIEW_REQUESTED];

const DocumentStatus = ({ documentId }: { documentId: string }): JSX.Element => {
  const { accessToken, userId } = useContext(AuthContext);
  const { document, setDocument, socket } = useContext(DocumentContext);
  const { success } = useContext(ToastContext);
  const [status, setStatus] = useState<StatusEnum | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasEditPermission =
    userId !== document?.userId &&
    userId === document?.assigneeId &&
    document?.status !== StatusEnum.DRAFT &&
    document?.status !== StatusEnum.RESOLVED;

  const disableButton = !hasEditPermission || isSaving || status === document?.status;

  const onChange = (newStatus: StatusEnum): void => {
    setStatus(newStatus);
  };

  const saveStatus = (): void => {
    // TODO: Consolidate API calls that require accessToken under one check
    // so we don't need to keep checking this
    if (document === null || accessToken === null || status === null) return;

    setIsSaving(true);
    socket.current.emit(SocketEvent.SEND_STATUS, status);
    void DocumentService.setStatus(accessToken, parseInt(documentId), status)
      .then(() => {
        success(`Successfully changed status to ${status}`);
        setDocument({ ...document, status });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  useEffect(() => {
    if (socket.current === null || document === null) return;

    const handler = (newStatus: StatusEnum): void => {
      setDocument({ ...document, status: newStatus });
    };

    socket.current.on(SocketEvent.RECEIVE_STATUS, handler);

    return () => {
      socket.current.off(SocketEvent.RECEIVE_STATUS, handler);
    };
  }, [socket.current]);

  useEffect(() => {
    if (document) {
      setStatus(document.status);
    }
  }, [document]);

  return (
    <div className="flex flex-col border-r-4 gap-y-3 bg-white shadow-md p-3">
      <Typography.Title
        level={5}
        style={{
          margin: 0,
        }}
      >
        Status
      </Typography.Title>
      <Select
        disabled={!hasEditPermission}
        showSearch
        placeholder="Select a status"
        optionFilterProp="children"
        onChange={onChange}
        filterOption={filterOption}
        value={status}
        options={Object.keys(statusToOptionMapping).map((s) => {
          // TODO: Fix type error with s
          return {
            value: s,
            label: statusToOptionMapping[s as keyof typeof statusToOptionMapping],
            disabled: disabledOptions.includes(s as unknown as StatusEnum),
          };
        })}
      />
      <Button disabled={disableButton} onClick={saveStatus}>
        Save Status
      </Button>
    </div>
  );
};

export default DocumentStatus;
