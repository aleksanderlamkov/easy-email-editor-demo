import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import '@arco-themes/react-easy-email-theme/css/arco.css';

import { useMemo } from 'react'
import { BlockManager, BasicType, JsonToMjml } from 'easy-email-core';
import { EmailEditor, EmailEditorProvider, useEditorContext } from 'easy-email-editor';
import { StandardLayout } from 'easy-email-extensions';
import mjml2html from 'mjml-browser';

type Variable = { key: string; name: string; sample: string };

const VARIABLES: Variable[] = [
  { key: 'firstName', name: 'Имя', sample: 'Саша' },
  { key: 'offerId',   name: 'ID оффера', sample: '12345' },
  { key: 'ctaUrl',    name: 'Ссылка CTA', sample: 'https://example.com' },
];

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

  // NEW: регэксп для {{vars}} и мапа сэмплов
  const rx = /{{\s*([\w.]+)\s*}}/g;
  const samplesMap = useMemo(
    () => Object.fromEntries(VARIABLES.map(v => [v.key, v.sample])),
    []
  );

  // NEW: подстановка сэмплов в HTML (только для превью/экспорта HTML)
  const injectSamples = (html: string) =>
    html.replace(rx, (m, key) => (samplesMap[key] ?? m));

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

    if (errors?.length) {
      console.warn('MJML errors:', errors);
    }

    download('template.html', injectSamples(html), 'text/html');
  };

  // NEW: копирование плейсхолдера
  const copyVar = async (key: string) => {
    await navigator.clipboard.writeText(`{{${key}}}`);
  };

  const previewHTML = () => {
    const mjml = JsonToMjml({ data: values.content, mode: 'production', context: null });
    const { html } = mjml2html(mjml);
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(injectSamples(html));
      w.document.close();
    }
  };

  return (
    <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'grid', gap: 8 }}>
      <div  style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
        <button onClick={exportJSON}>Export JSON</button>
        <button onClick={exportMJML}>Export MJML</button>
        <button onClick={exportHTML}>Export HTML</button>
        <button onClick={previewHTML}>Preview</button>
      </div>

      <div>
        {/* NEW: список переменных (копируют {{tag}}) */}
        <span
          style={{ opacity: 0.7 }}>Скопировать переменную в буфер обмена:</span>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {VARIABLES.map(v => (
            <button key={v.key} onClick={() => copyVar(v.key)}
                    title={`Копировать {{${v.key}}} (${v.sample})`}>
              {v.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
