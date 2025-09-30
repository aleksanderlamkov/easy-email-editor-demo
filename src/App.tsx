import Editor, { type EasyEmailValues } from './components/Editor'
import myTemplateJson from './fixtures/test2.json'
import type { TVariable } from './components/Editor'

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
    <Editor
      data={myTemplateJson as EasyEmailValues}
      variables={VARIABLES}
      height="100vh"
    />
  )
}

export default App
