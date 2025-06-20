import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface QuestionEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ initialContent = '', onSave }) => {
  const editorRef = useRef<any>(null);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (editorRef.current) {
      const editorContent = editorRef.current.getContent();
      setContent(editorContent);
      onSave(editorContent);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setContent(initialContent);
    }
  }, [initialContent]);

  return (
    <div>
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={content}
        apiKey="z9i4exr56m5jcsf0ivw49dq6srv6oh5sv0o9k5xj86yk4j6n"
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          mobile: {
            height: 300,
            menubar: true,
            plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
            toolbar: 'undo redo | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
          }
        }}
      />
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          Save Question
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;
