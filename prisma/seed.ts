import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Źródła krajowe
  const krajowe = [
    {
      name: 'Wyszukiwarka naborów (MFiPR)',
      type: 'krajowy/wykazy',
      region: 'kraj',
      url: 'https://www.funduszeeuropejskie.gov.pl/strony/skorzystaj/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'Harmonogramy naborów – wszystkie programy',
      type: 'krajowy/wykazy',
      region: 'kraj',
      url: 'https://www.funduszeeuropejskie.gov.pl/strony/skorzystaj/harmonogramy-naborow-wnioskow/harmonogramy-2021-2027/',
      scraperType: 'ai',
    },
    {
      name: 'FENG – Nabory / Harmonogram (Nowoczesna Gospodarka)',
      type: 'program krajowy',
      region: 'kraj',
      url: 'https://www.nowoczesnagospodarka.gov.pl/strony/dowiedz-sie-wiecej-o-programie/nabory-wnioskow/',
      scraperType: 'ai',
    },
    {
      name: 'PARP – Harmonogram naborów',
      type: 'agencja krajowa',
      region: 'kraj',
      url: 'https://www.parp.gov.pl/harmonogram-naborow',
      scraperType: 'ai',
    },
    {
      name: 'NCBR – Aktualne konkursy',
      type: 'agencja krajowa',
      region: 'kraj',
      url: 'https://www.ncbr.gov.pl/aktualne-konkursy/',
      scraperType: 'ai',
    },
    {
      name: 'BGK – Programy i fundusze',
      type: 'agencja krajowa',
      region: 'kraj',
      url: 'https://www.bgk.pl/programy-i-fundusze/',
      scraperType: 'ai',
    },
  ]

  // Źródła regionalne
  const regionalne = [
    {
      name: 'FEM Mazowsze – Nabory',
      type: 'regionalny',
      region: 'mazowieckie',
      url: 'https://funduszeuedlamazowsza.eu/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'FEM Mazowsze – Harmonogram',
      type: 'regionalny',
      region: 'mazowieckie',
      url: 'https://funduszeuedlamazowsza.eu/harmonogram-naborow/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Warszawa – aktualne nabory',
      type: 'WUP',
      region: 'mazowieckie',
      url: 'https://wupwarszawa.praca.gov.pl/fundusze-europejskie-dla-mazowsza-2021-20273',
      scraperType: 'ai',
    },
    {
      name: 'FELU Lubelskie – Nabory',
      type: 'regionalny',
      region: 'lubelskie',
      url: 'https://funduszeue.lubelskie.pl/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'LAWP – Nabory (Lubelska Agencja)',
      type: 'agencja regionalna',
      region: 'lubelskie',
      url: 'https://funduszeue.lubelskie.pl/lawp/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'FEM Małopolska – Nabory',
      type: 'regionalny',
      region: 'małopolskie',
      url: 'https://fundusze.malopolska.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEM Małopolska – Nabory wniosków',
      type: 'regionalny',
      region: 'małopolskie',
      url: 'https://fundusze.malopolska.pl/nabory-wnioskow',
      scraperType: 'ai',
    },
    {
      name: 'FESL Śląskie – Nabory',
      type: 'regionalny',
      region: 'śląskie',
      url: 'https://funduszeue.slaskie.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEDS Dolny Śląsk – Nabory',
      type: 'regionalny',
      region: 'dolnośląskie',
      url: 'https://funduszeuedolnoslaskie.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEO Opolskie – Nabory',
      type: 'regionalny',
      region: 'opolskie',
      url: 'https://funduszeue.opolskie.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEKP Kujawsko-Pomorskie – Nabory',
      type: 'regionalny',
      region: 'kujawsko-pomorskie',
      url: 'https://funduszeue.kujawsko-pomorskie.pl/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'FEP Pomorskie – Nabory',
      type: 'regionalny',
      region: 'pomorskie',
      url: 'https://funduszeuepomorskie.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEPZ Zachodniopomorskie – Nabory',
      type: 'regionalny',
      region: 'zachodniopomorskie',
      url: 'https://funduszeue.wzp.pl/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'FELB Lubuskie – Nabory',
      type: 'regionalny',
      region: 'lubuskie',
      url: 'https://funduszeue.lubuskie.pl/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'FEPD Podlaskie – Nabory',
      type: 'regionalny',
      region: 'podlaskie',
      url: 'https://funduszeuepodlaskie.pl/nabory/',
      scraperType: 'ai',
    },
    {
      name: 'FEPK Podkarpackie – Nabory',
      type: 'regionalny',
      region: 'podkarpackie',
      url: 'https://funduszeue.podkarpackie.pl/nabory-wnioskow',
      scraperType: 'ai',
    },
    {
      name: 'FESW Świętokrzyskie – Nabory',
      type: 'regionalny',
      region: 'świętokrzyskie',
      url: 'https://funduszeueswietokrzyskie.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEŁ Łódzkie – Nabory',
      type: 'regionalny',
      region: 'łódzkie',
      url: 'https://funduszeue.lodzkie.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEWM Warmińsko-Mazurskie – Nabory',
      type: 'regionalny',
      region: 'warmińsko-mazurskie',
      url: 'https://funduszeeuropejskie.warmia.mazury.pl/nabory',
      scraperType: 'ai',
    },
    {
      name: 'FEWP Wielkopolskie – Nabory',
      type: 'regionalny',
      region: 'wielkopolskie',
      url: 'https://funduszeue.wielkopolskie.pl/nabory',
      scraperType: 'ai',
    },
  ]

  // WUP-y (Wojewódzkie Urzędy Pracy)
  const wupy = [
    {
      name: 'WUP Kraków',
      type: 'WUP',
      region: 'małopolskie',
      url: 'https://wupkrakow.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Poznań',
      type: 'WUP',
      region: 'wielkopolskie',
      url: 'https://wuppoznan.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Gdańsk',
      type: 'WUP',
      region: 'pomorskie',
      url: 'https://wupgdansk.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Wrocław',
      type: 'WUP',
      region: 'dolnośląskie',
      url: 'https://wupdolnoslaski.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Katowice',
      type: 'WUP',
      region: 'śląskie',
      url: 'https://wupkatowice.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Rzeszów',
      type: 'WUP',
      region: 'podkarpackie',
      url: 'https://wuprzeszow.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Toruń',
      type: 'WUP',
      region: 'kujawsko-pomorskie',
      url: 'https://wuptorun.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Lublin',
      type: 'WUP',
      region: 'lubelskie',
      url: 'https://wuplublin.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Łódź',
      type: 'WUP',
      region: 'łódzkie',
      url: 'https://wuplodz.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Olsztyn',
      type: 'WUP',
      region: 'warmińsko-mazurskie',
      url: 'https://wupolsztyn.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Białystok',
      type: 'WUP',
      region: 'podlaskie',
      url: 'https://wupbialystok.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Szczecin',
      type: 'WUP',
      region: 'zachodniopomorskie',
      url: 'https://wupszczecin.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Opole',
      type: 'WUP',
      region: 'opolskie',
      url: 'https://wupopole.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Kielce',
      type: 'WUP',
      region: 'świętokrzyskie',
      url: 'https://wupkielce.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'WUP Zielona Góra',
      type: 'WUP',
      region: 'lubuskie',
      url: 'https://wupzielonagora.praca.gov.pl/',
      scraperType: 'ai',
    },
  ]

// MUP-y (Miejskie Urzędy Pracy)
  const mupy = [
    {
      name: 'Urząd Pracy m.st. Warszawy',
      type: 'MUP',
      region: 'mazowieckie',
      url: 'https://warszawa.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'Grodzki Urząd Pracy w Krakowie',
      type: 'MUP',
      region: 'małopolskie',
      url: 'https://gupkrakow.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'Gdański Urząd Pracy',
      type: 'MUP',
      region: 'pomorskie',
      url: 'https://gdansk.praca.gov.pl/',
      scraperType: 'ai',
    },
  ]

  // PUP-y (Powiatowe Urzędy Pracy)
  const pupy = [
    {
      name: 'PUP Poznań',
      type: 'PUP',
      region: 'wielkopolskie',
      url: 'https://poznan.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'PUP Wrocław',
      type: 'PUP',
      region: 'dolnośląskie',
      url: 'https://wroclaw.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'PUP Katowice',
      type: 'PUP',
      region: 'śląskie',
      url: 'https://katowice.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'PUP Szczecin',
      type: 'PUP',
      region: 'zachodniopomorskie',
      url: 'https://szczecin.praca.gov.pl/',
      scraperType: 'ai',
    },
    {
      name: 'PUP Lublin',
      type: 'PUP',
      region: 'lubelskie',
      url: 'https://lublin.praca.gov.pl/',
      scraperType: 'ai',
    },
  ]

  const allSources = [...krajowe, ...regionalne, ...wupy, ...mupy, ...pupy]

  console.log(`📊 Adding ${allSources.length} sources...`)

  for (const source of allSources) {
    await prisma.source.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    })
  }

  console.log('✅ Seeding completed!')
  console.log(`📈 Total sources: ${allSources.length}`)
  console.log(`   - Krajowe: ${krajowe.length}`)
  console.log(`   - Regionalne: ${regionalne.length}`)
  console.log(`   - WUP-y: ${wupy.length}`)
  console.log(`   - MUP-y: ${mupy.length}`)
  console.log(`   - PUP-y: ${pupy.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })