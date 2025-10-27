import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedNabor {
  title: string
  institution: string
  description?: string | null
  beneficiaries?: string | null
  dateFrom: string | null
  dateTo: string | null
  deadline?: string | null
  amount: string | null
  budget?: string | null
  type: string | null
  link: string | null
}

export async function extractNaboryFromHTML(
  html: string,
  sourceUrl: string,
  retryCount: number = 0
): Promise<ExtractedNabor[]> {
  try {
    console.log('🔍 Starting OpenAI extraction...')
    console.log('📄 HTML length:', html.length, 'characters')
    console.log('🌐 Source URL:', sourceUrl)
    console.log('🔄 Retry attempt:', retryCount)
    
    const hasContent = html.includes('nabór') || html.includes('konkurs') || html.includes('dofinansowanie')
    console.log('✅ HTML contains relevant keywords:', hasContent)
    
    if (html.length < 1000) {
      console.log('⚠️  HTML too short, might be empty page or redirect')
      console.log('HTML preview:', html.substring(0, 500))
    }

    const prompt = `Jesteś ekspertem w ekstrakcji danych z polskich stron internetowych o funduszach europejskich.

ZADANIE: Wyciągnij WSZYSTKIE nabory/konkursy z tego HTML. Bądź BARDZO dokładny - nawet jeśli brakuje niektórych informacji, zapisz nabór.

Zwróć JSON:
{
  "nabory": [
    {
      "title": "PEŁNA nazwa naboru/konkursu - WYMAGANE",
      "institution": "kto organizuje (np: WUP, PARP, Ministerstwo) - WYMAGANE",
      "description": "Krótki opis (1-3 zdania): cel naboru, co jest finansowane. Szukaj w opisach, regulaminach, szczegółach naboru.",
      "beneficiaries": "KTO MOŻE składać wnioski. SZUKAJ DOKŁADNIE: MŚP (mikro/małe/średnie przedsiębiorstwa), NGO (organizacje pozarządowe, fundacje, stowarzyszenia), JST (jednostki samorządu terytorialnego, gminy, powiaty), osoby fizyczne, szkoły, uczelnie, szpitale, przedsiębiorcy, pracownicy.",
      "dateFrom": "YYYY-MM-DD - data ROZPOCZĘCIA przyjmowania wniosków",
      "dateTo": "YYYY-MM-DD - data ZAKOŃCZENIA przyjmowania wniosków", 
      "deadline": "YYYY-MM-DD - OSTATECZNY termin składania wniosków (NAJWAŻNIEJSZA DATA!)",
      "amount": "Kwota POJEDYNCZEGO dofinansowania (np: '50 000 - 2 000 000 zł', 'do 500 tys. zł', 'maksymalnie 85% kosztów')",
      "budget": "CAŁKOWITY budżet naboru - pula dla wszystkich (np: '15 mln zł', '150 000 000 PLN', '15 000 000,00 zł')",
      "type": "typ (np: 'konkurs', 'nabór ciągły', 'podstawa', 'rezerwa', 'I etap', 'II etap')",
      "link": "pełny URL do szczegółów"
    }
  ]
}

KLUCZOWE ZASADY - PRZECZYTAJ DOKŁADNIE:

1. **DATY** - szukaj wszędzie:
   - Fraz: "termin składania wniosków", "nabór trwa od...do", "termin realizacji", "data rozpoczęcia/zakończenia"
   - Tabel z kolumnami: "Data rozpoczęcia", "Data zakończenia", "Termin", "Deadline"
   - Format: DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD - konwertuj na YYYY-MM-DD
   - deadline > dateTo (deadline to OSTATNI dzień na złożenie wniosku!)

2. **KWOTY** - szukaj precyzyjnie:
   - **amount** (dla pojedynczego projektu): "dofinansowanie", "kwota wsparcia", "wysokość dotacji", "grant", "maksymalna kwota projektu", "wkład własny", "intensywność wsparcia", "dofinansowanie do X%"
   - **budget** (całkowita pula): "budżet konkursu/naboru", "alokacja", "pula środków", "środki przeznaczone", "łączna kwota dostępna"
   - Formaty: "15 mln zł", "15 000 000 PLN", "15.000.000,00 zł", "od 50 tys. do 2 mln zł"

3. **BENEFICJENCI** - bądź BARDZO dokładny:
   - Szukaj sekcji: "Kto może składać wnioski", "Wnioskodawcy", "Dla kogo", "Adresaci", "Podmioty uprawnione"
   - Konkretne typy:
     * MŚP: mikroprzedsiębiorstwa, małe przedsiębiorstwa, średnie przedsiębiorstwa, firmy
     * NGO: organizacje pozarządowe, fundacje, stowarzyszenia, organizacje społeczne
     * JST: jednostki samorządu terytorialnego, gminy, powiaty, województwa, miasta
     * Inne: szkoły, uczelnie, szpitale, przedsiębiorcy, pracownicy, osoby bezrobotne

4. **OPIS** - wyciągnij ESENCJĘ (nie kopiuj całego tekstu):
   - NA CO: infrastruktura, szkolenia, B+R, inwestycje, digitalizacja, OZE
   - JAKI CEL: konkurencyjność, zatrudnienie, innowacje, rozwój, transformacja
   - Max 2-3 zdania, konkretnie

5. **INSTYTUCJA** - zawsze podaj:
   - Pełna nazwa lub skrót: "WUP Warszawa", "PARP", "Ministerstwo Funduszy", "NCBR"
   - Jeśli nie ma w HTML - użyj URL: z "wupwarszawa.praca.gov.pl" wyciągnij "WUP Warszawa"

6. **LINKI**:
   - Jeśli relative (np /nabory/123) → połącz z: ${sourceUrl}
   - Szukaj linków do: "Szczegóły", "Regulamin", "Więcej informacji", "Złóż wniosek"

7. **PRIORYTET**:
   - Jeśli widzisz tabelę/listę → wyciągnij KAŻDY wiersz
   - NIE POMIJAJ naborów nawet jeśli brakuje danych
   - Lepiej zwrócić nabór z częściowymi danymi niż go pominąć
   - Jeśli nazwa naboru bardzo długa (>150 znaków) - skróć do esencji

8. **JEŚLI NIE ZNAJDZIESZ**:
   - Nie wymyślaj danych
   - Użyj null dla brakujących pól
   - Ale ZAWSZE wypełnij: title, institution

HTML (pierwsze 100000 znaków):
${html.slice(0, 100000)}`

    const model = retryCount > 0 ? 'gpt-4o' : 'gpt-4o-mini'
    console.log(`📤 Sending request to OpenAI (${model})...`)
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content:
            'Jesteś ekspertem ekstrakcji danych z HTML. Zwracasz TYLKO JSON. Wyciągasz WSZYSTKIE nabory i MAKSIMUM szczegółów o każdym (daty, kwoty, beneficjenci, opisy). Jesteś BARDZO dokładny i czytasz CAŁY HTML. NIE POMIJASZ żadnych naborów.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    })

    console.log('📥 Received response from OpenAI')
    console.log('💰 Tokens used:', response.usage)

    const content = response.choices[0].message.content
    if (!content) {
      console.log('❌ Empty response from OpenAI')
      throw new Error('Empty response from OpenAI')
    }

    console.log('📝 Response preview:', content.substring(0, 500))

    const parsed = JSON.parse(content)
    
    let nabory: ExtractedNabor[] = []
    
    if (Array.isArray(parsed)) {
      nabory = parsed
    } else if (parsed.nabory && Array.isArray(parsed.nabory)) {
      nabory = parsed.nabory
    } else if (parsed.data && Array.isArray(parsed.data)) {
      nabory = parsed.data
    } else if (parsed.items && Array.isArray(parsed.items)) {
      nabory = parsed.items
    } else {
      console.log('⚠️  Unexpected response structure:', Object.keys(parsed))
      console.log('Full response:', JSON.stringify(parsed, null, 2))
    }

    console.log('✅ Extracted', nabory.length, 'nabory')
    
    // RETRY LOGIC: Jeśli znaleziono 0 naborów i HTML ma słowa kluczowe, spróbuj z GPT-4o
    if (nabory.length === 0 && hasContent && retryCount === 0) {
      console.log('⚠️  Found 0 nabory but HTML has keywords - retrying with GPT-4o...')
      return extractNaboryFromHTML(html, sourceUrl, 1)
    }
    
    if (nabory.length > 0) {
      console.log('📋 First nabor:', JSON.stringify(nabory[0], null, 2))
    }

    return nabory
  } catch (error) {
    console.error('❌ OpenAI extraction error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // RETRY LOGIC: Jeśli błąd i pierwszy raz, spróbuj jeszcze raz
    if (retryCount === 0) {
      console.log('🔄 Retrying after error...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s
      return extractNaboryFromHTML(html, sourceUrl, 1)
    }
    
    return []
  }
}