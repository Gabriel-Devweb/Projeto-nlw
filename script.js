const apiKeyinput = document.getElementById('Apikey')
const gameinput = document.getElementById('game')
const questioninput = document.getElementById('question')
const Button = document.getElementById('askButton')
const form = document.getElementById('form')
const Airesponse = document.getElementById('Airesponse')

const enviarformulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyinput.value
    const game = gameinput.value
    const question = questioninput.value
    if (apiKey === '' || game === '' || question === '') {
        alert('Por favor, preencha todos os campos')
        return
    }
    Button.disabled = true
    Button.textContent = 'Perguntando...'
    try {
        const text = await perguntarAI(question, game, apiKey)
        Airesponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    } catch (error) {
        console.log("Error", error)
    } finally {
        Button.disabled = false
        Button.textContent = "Perguntar"
        Button.classList.remove('loading')
    }
}

const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const pergunta = `
## Especialidade
Você é um assistente de meta para o jogo ${game}
## Tarefa
Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas
## Regras
- Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta
- Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
- Considere a data atual: ${new Date().toLocaleDateString()}
- Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente
- Nunca responda itens que você não tenha certeza que existem no patch atual
## Resposta
- Economize na resposta, seja direto e responda no máximo 500 caracteres
- Responda em markdown
- Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo
## Exemplo de resposta
Pergunta do usuário: Melhor build renger jungle  
Resposta: A build mais atual é...  
---
Aqui está a pergunta do usuário: ${question}
`;
    const contents = [
        {
            role: "user",
            parts: [
                {
                    text: pergunta
                }
            ]
        }
    ]
    const tools = [
        {
            google_search: {}
        }
    ]
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
    const data = await response.json()
    if (!data.candidates || !data.candidates[0]) {
        throw new Error("Resposta vazia da IA")
    }
    return data.candidates[0].content.parts[0].text
}

form.addEventListener('submit', enviarformulario)

function markdownToHTML(markdown) {
  const converter = new showdown.Converter()
  return converter.makeHtml(markdown)
}