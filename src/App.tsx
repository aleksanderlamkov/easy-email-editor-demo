import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import '@arco-themes/react-easy-email-theme/css/arco.css';

import { BlockManager, BasicType, JsonToMjml } from 'easy-email-core';
import { EmailEditor, EmailEditorProvider, useEditorContext } from 'easy-email-editor';
import { StandardLayout } from 'easy-email-extensions';
import mjml2html from 'mjml-browser';

const initialValues = {
  subject: 'Welcome to Easy-email',
  subTitle: 'Nice to meet you!',
  content: BlockManager.getBlockByType(BasicType.PAGE)!.create({}),
};

export default function App() {
  return (
    <EmailEditorProvider
      data={initialValues}
      height="100vh"
      autoComplete
      dashed={false}
      // onUploadImage={async (blob) => URL.createObjectURL(blob)}
    >
      {() => (
        <StandardLayout showSourceCode>
          <ExportToolbar />
          <EmailEditor />
        </StandardLayout>
      )}
    </EmailEditorProvider>
  );
}

function ExportToolbar() {
  // ← актуальные значения редактора из контекста (react-final-form)
  const { formState } = useEditorContext();
  const { values } = formState

  const download = (name: string, content: string, type = 'text/plain') => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportJSON = () => {
    download('template.json', JSON.stringify(values, null, 2), 'application/json');
  };

  const exportMJML = () => {
    const mjml = JsonToMjml({ data: values.content, mode: 'production', context: null });
    download('template.mjml', mjml, 'application/xml');
  };

  const exportHTML = () => {
    const mjml = JsonToMjml({ data: values.content, mode: 'production', context: null });
    const { html, errors } = mjml2html(mjml, { minify: true });
    if (errors?.length) console.warn('MJML errors:', errors);
    download('template.html', html, 'text/html');
  };

  const previewHTML = () => {
    const mjml = JsonToMjml({ data: values.content, mode: 'production', context: null });
    const { html } = mjml2html(mjml);
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
      <button onClick={exportJSON}>Export JSON</button>
      <button onClick={exportMJML}>Export MJML</button>
      <button onClick={exportHTML}>Export HTML</button>
      <button onClick={previewHTML}>Preview</button>
    </div>
  );
}
