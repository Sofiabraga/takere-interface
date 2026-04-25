# Takere — Interface Mobile de Lembretes de Medicamentos

App mobile para acompanhamento de medicamentos do paciente, construído com **React Native + Expo + TypeScript**.

Requer o backend [`takere-api`](../takere-api) em execução para funcionar.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Backend `takere-api` rodando (veja instruções abaixo)
- Para testar no iOS Simulator: Xcode instalado
- Para testar no celular físico: app [Expo Go](https://expo.dev/go)

---

## Configuração rápida

### 1. Suba o backend primeiro

```bash
cd ../takere-api
npm install
npm run dev
# Servidor em http://localhost:3000
```

### 2. Configure a URL da API

Abra `src/services/api.ts` e ajuste `API_BASE_URL`:

| Ambiente | URL |
|---|---|
| iOS Simulator | `http://<IP-LAN-do-seu-Mac>:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Celular físico | `http://<IP-LAN-do-seu-Mac>:3000` |

> **Por que não `localhost`?** No simulador/emulador, `localhost` aponta para o próprio dispositivo virtual, não para o seu Mac. Use o IP da sua rede local (ex: `192.168.x.x`).
>
> Para descobrir seu IP: `ipconfig getifaddr en0` (macOS)

### 3. Suba o app

```bash
cd takere-interface
npm install
npx expo start
```

---

## Contas de teste

As contas abaixo são criadas automaticamente pelo backend na primeira inicialização:

| Nome | Email | Senha | Perfil |
|---|---|---|---|
| Paciente Teste | `test@test.com` | `test123` | 7 medicamentos, condições crônicas, aderência mista (~72%) |
| Carlos Mendes | `carlos@test.com` | `carlos123` | 5 medicamentos, recuperação pós-cirúrgica, alta aderência (~97%) |
| Ana Lima | `ana@test.com` | `ana123` | 5 medicamentos, suplementos + hormonal, baixa aderência (~45%) |

---

## Funcionalidades

- **Login** com persistência de sessão (token salvo no dispositivo)
- **Tela "Hoje"** — lista de medicamentos do dia agrupados por período (manhã/tarde/noite)
- **Marcar como tomado** com atualização otimista e desfazer por 3,5 segundos
- **Filtros** por status (Todos / Tomados / Atrasados / Pendentes)
- **Tela "Histórico"** — aderência dos últimos 7 dias com calendário semanal interativo
- **Logout** pelo botão no cabeçalho da tela principal

---

## Estrutura do projeto

```
takere-interface/
├── App.tsx                         # Ponto de entrada + navegação + guard de auth
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Tela principal (medicamentos de hoje)
│   │   ├── HistoryScreen.tsx       # Histórico semanal de aderência
│   │   └── LoginScreen.tsx         # Tela de login
│   ├── components/
│   │   ├── MedicationCard.tsx      # Card expansível de medicamento
│   │   ├── DaySummary.tsx          # Resumo do dia (stats + barra de progresso)
│   │   ├── WeekCalendar.tsx        # Calendário semanal com barras de aderência
│   │   ├── SectionHeader.tsx       # Cabeçalho de período (Manhã/Tarde/Noite)
│   │   └── UndoSnackbar.tsx        # Snackbar com ação de desfazer
│   ├── context/
│   │   └── AuthContext.tsx         # Estado de autenticação (token, user, login, logout)
│   ├── services/
│   │   └── api.ts                  # Cliente HTTP centralizado (fetch + JWT)
│   ├── data/
│   │   ├── medications.ts          # Tipos TypeScript (Medication, MedicationStatus)
│   │   └── history.ts              # Tipos + funções de cálculo de aderência
│   └── theme/
│       └── index.ts                # Cores, espaçamentos, tipografia
├── assets/
├── app.json                        # Configuração Expo
└── tsconfig.json
```

---

## Tecnologias

- [Expo](https://expo.dev/) v54 — framework React Native
- [React Navigation](https://reactnavigation.org/) — navegação (bottom tabs + native stack)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — persistência do token JWT
- [Expo Vector Icons](https://icons.expo.fyi/) — ícones Ionicons
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática

---

## Cronograma de desenvolvimento

### Fase 1 — Interface base ✅
- [x] Setup Expo + TypeScript
- [x] Tema de cores e design tokens
- [x] Tela principal com lista de medicamentos
- [x] Cards por status (tomado / atrasado / pendente)
- [x] Resumo do dia com barra de progresso
- [x] Filtros por status
- [x] Seções por período do dia (manhã / tarde / noite)
- [x] Tela de histórico semanal

### Fase 2 — Backend e autenticação ✅
- [x] Backend TypeScript com Express + SQLite
- [x] Autenticação JWT (login / registro)
- [x] Tela de login
- [x] Persistência de sessão com AsyncStorage
- [x] Integração da tela principal com a API
- [x] Integração do histórico com a API
- [x] Logout

### Fase 3 — Funcionalidades adicionais
- [ ] Notificações locais com `expo-notifications`
- [ ] Tela de cadastro de novos medicamentos
- [ ] Pull-to-refresh nas telas
- [ ] Modo escuro
