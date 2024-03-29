/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import useAuth from '@src/hooks/useAuth';
import { BASE_URL } from '@src/services/api';
import SocketEvent from '@src/types/enums/socket-events';
import type DocumentInterface from '@src/types/interfaces/document';
import { DocumentContext } from '@src/context/DocumentContext';
import { ToastContext } from '@src/context/ToastContext';
import type { RemirrorJSON } from 'remirror';
import { type EditorRef } from '@src/types/interfaces/editor-ref';

interface EditorContextInterface {
  editorState: RemirrorJSON;
  setEditorState: Dispatch<SetStateAction<RemirrorJSON>>;
  documentRendered: boolean;
  setDocumentRendered: Dispatch<SetStateAction<boolean>>;
  editorRef: null | MutableRefObject<null | EditorRef>;
  handleEditorChange: (content: RemirrorJSON) => void;
}

const defaultEditorState: RemirrorJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { dir: null, ignoreBidiAutoUpdate: null },
      content: [{ type: 'text', text: 'test' }],
    },
  ],
};

const defaultValues = {
  editorState: defaultEditorState,
  setEditorState: () => {},
  documentRendered: false,
  setDocumentRendered: () => {},
  editorRef: null,
  handleEditorChange: () => {},
};

export const EditorContext = createContext<EditorContextInterface>(defaultValues);

interface EditorProviderInterface {
  children: JSX.Element;
}

const DEFAULT_SAVE_TIME = 1500;
let saveInterval: null | NodeJS.Timeout = null;

export const EditorProvider = ({ children }: EditorProviderInterface): JSX.Element => {
  const [editorState, setEditorState] = useState(defaultValues.editorState);
  const [documentRendered, setDocumentRendered] = useState(defaultValues.documentRendered);
  const editorRef = useRef<null | EditorRef>(defaultValues.editorRef);

  const { document, socket, setCurrentUsers, setSaving, setDocument, saveDocument } = useContext(DocumentContext);
  const { error } = useContext(ToastContext);
  const { accessToken } = useAuth();

  // Send changes
  const handleEditorChange = (content: RemirrorJSON): void => {
    if (JSON.stringify(content) === JSON.stringify(editorState)) return;

    setEditorState(content);

    // Send changes to other clients
    if (socket === null || socket.current === null) return;

    socket.current.emit(SocketEvent.SEND_CHANGES, content);

    let updatedDocument: DocumentInterface | null = null;
    if (document) {
      updatedDocument = {
        ...document,
        content: JSON.stringify(content),
      };
      setDocument(updatedDocument);
    }

    if (document === null || JSON.stringify(content) === document.content) {
      return;
    }

    // Send changes to server
    setSaving(true);

    if (saveInterval) {
      clearInterval(saveInterval);
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    saveInterval = setInterval(async (): Promise<void> => {
      if (updatedDocument) {
        await saveDocument(updatedDocument);
      }
      if (saveInterval) clearInterval(saveInterval);
    }, DEFAULT_SAVE_TIME);
  };

  // Load document content
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (documentRendered || document === null || document.content === null) return;

    try {
      const newEditorState = JSON.parse(document.content) as RemirrorJSON;
      setEditorState(newEditorState);
      if (editorRef?.current) {
        editorRef.current.setContent(newEditorState);
      }
    } catch {
      error('Error when loading document.');
    } finally {
      setDocumentRendered(true);
    }
  }, [document]);

  // Connect socket
  useEffect(() => {
    if (
      document === null ||
      accessToken === null ||
      socket === null ||
      (socket.current !== null && socket.current.connected)
    )
      return;

    socket.current = io(BASE_URL, {
      query: { documentId: document.id, accessToken },
    }).connect();
  }, [document, accessToken, socket]);

  // Receive changes
  useEffect(() => {
    if (socket.current === null) return;

    const handler = (newEditorState: RemirrorJSON): void => {
      // For some reason client receives change it just sent,
      // so we prevent re-rendering for itself
      if (JSON.stringify(newEditorState) === JSON.stringify(editorState)) return;
      setEditorState(newEditorState);
      if (editorRef?.current) {
        editorRef.current.setContent(newEditorState);
      }
    };

    socket.current.on(SocketEvent.RECEIVE_CHANGES, handler);

    return () => {
      socket.current.off(SocketEvent.RECEIVE_CHANGES, handler);
    };
  }, [socket.current]);

  // Current users updated
  useEffect(() => {
    if (socket.current === null) return;

    const handler = (currentUsers: string[]): void => {
      setCurrentUsers(new Set<string>(currentUsers));
    };

    socket.current.on(SocketEvent.CURRENT_USERS_UPDATE, handler);

    return () => {
      socket.current.off(SocketEvent.CURRENT_USERS_UPDATE, handler);
    };
  }, [socket.current]);

  return (
    <EditorContext.Provider
      value={{
        editorState,
        documentRendered,
        editorRef,
        setEditorState,
        setDocumentRendered,
        handleEditorChange,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
