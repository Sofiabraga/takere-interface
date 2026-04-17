# Takere — Interface Mobile de Lembretes de Medicamentos

Interface mobile para acompanhamento de medicamentos do paciente, construída com **React Native + Expo**.

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

Para testar no celular físico, instale o app **Expo Go** no seu dispositivo:
- [iOS — App Store](https://apps.apple.com/app/expo-go/id982107779)
- [Android — Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Instalação

```bash
# Navegue até a pasta do projeto
cd takere-interface

# Instale as dependências
npm install
```

---

## Como rodar

### No celular físico (recomendado para testar a UI)

```bash
npx expo start
```

1. Abra o app **Expo Go** no celular
2. Escaneie o QR Code que aparecer no terminal
3. O app carregará automaticamente

### No emulador Android

```bash
npx expo start --android
```

> Requer Android Studio com um emulador configurado.

### No simulador iOS (apenas macOS)

```bash
npx expo start --ios
```

> Requer Xcode instalado.

### No navegador (limitado — não recomendado para UI nativa)

```bash
npx expo start --web
```

---

## Como testar a tela

A tela principal (`HomeScreen`) já contém **dados mock** em `src/data/medications.ts`. Você pode testar:

| O que testar | Como |
|---|---|
| Cards verdes | Medicamentos com `status: 'taken'` — aparecem com fundo verde |
| Cards vermelhos | Medicamentos com `status: 'late'` — aparecem com fundo vermelho |
| Cards amarelos | Medicamentos com `status: 'pending'` — borda cinza, badge amarelo |
| Filtros | Toque nas chips "Tomados", "Atrasados", "Pendentes" para filtrar a lista |
| Barra de progresso | Mostra quantos medicamentos foram tomados no dia |
| Notificação | O ícone de sino fica com ponto vermelho quando há atrasados |

Para **adicionar ou modificar medicamentos mock**, edite o arquivo:

```
src/data/medications.ts
```

Altere o campo `status` de qualquer medicamento para `'taken'`, `'late'` ou `'pending'` e o app vai atualizar em tempo real (hot reload).

---

## Estrutura do projeto

```
takere-interface/
├── App.tsx                      # Ponto de entrada + navegação
├── src/
│   ├── screens/
│   │   └── HomeScreen.tsx       # Tela principal
│   ├── components/
│   │   ├── MedicationCard.tsx   # Card de cada medicamento
│   │   └── DaySummary.tsx       # Resumo do dia (stats + barra)
│   ├── data/
│   │   └── medications.ts       # Dados mock + tipos TypeScript
│   └── theme/
│       └── index.ts             # Cores, espaçamentos, tipografia
├── assets/                      # Ícones e splash screen
├── app.json                     # Configuração do Expo
└── tsconfig.json                # Configuração TypeScript
```

---

## Cronograma de desenvolvimento

### Fase 1 — Interface base ✅ (concluído)
- [x] Setup Expo + TypeScript
- [x] Tema de cores e design tokens
- [x] Dados mock com tipos TypeScript
- [x] Tela principal com lista de medicamentos
- [x] Card de medicamento (verde / vermelho / pendente)
- [x] Resumo do dia com barra de progresso
- [x] Filtros por status

### Fase 2 — Melhorias de UX
- [ ] Animação ao marcar medicamento como tomado
- [ ] Tela de detalhes do medicamento
- [ ] Seções por período do dia (manhã / tarde / noite)
- [ ] Pull-to-refresh
- [ ] Modo escuro

### Fase 3 — Funcionalidades adicionais
- [ ] Notificações locais com `expo-notifications`
- [ ] Histórico de aderência por semana/mês
- [ ] Tela de configuração de novos medicamentos
- [ ] Integração com backend (API REST)

---

## Tecnologias

- [Expo](https://expo.dev/) — framework React Native
- [React Navigation](https://reactnavigation.org/) — navegação entre telas
- [Expo Vector Icons](https://icons.expo.fyi/) — biblioteca de ícones
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática