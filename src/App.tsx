import EmailTemplateBuilder from './components/EmailTemplateBuilder'
import myTemplateJson from './fixtures/test2.json'
import type { TVariable } from './components/EmailTemplateBuilder'
import type { IEmailTemplate } from 'easy-email-editor/lib/typings'

const VARIABLES: TVariable[] = [
  {
    key: 'firstName',
    name: 'Имя',
    sample: 'Иван',
  },
  {
    key: 'lastName',
    name: 'Фамилия',
    sample: 'Иванов',
  },
  {
    key: 'vacancyTitle',
    name: 'Название вакансии',
    sample: 'Разработчик интерфейсов',
  },
]

const App = () => {
  return (
    <EmailTemplateBuilder
      data={myTemplateJson as IEmailTemplate}
      variables={VARIABLES}
      height="100vh"
      onSave={(values) => {
        console.debug('values:', values)
      }}
    />
  )
}

export default App
