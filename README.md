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
cd api
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
npm install
npx expo start (--lan --clear)
```

#### Usando dispositivos em redes diferentes (celular no 5G, notebook no WiFi)

O modo padrão (`--lan`) exige que ambos os dispositivos estejam na mesma rede. Se não for o caso, use o modo tunnel:

```bash
npx expo start --tunnel
```

**Pré-requisitos para o tunnel:**

```bash
# Instalar o ngrok (necessário uma vez)
brew install ngrok
# ou
npm install -g ngrok

# Instalar o pacote de integração do Expo
npx expo install @expo/ngrok@^4.0.0
```

> O tunnel usa o ngrok para criar uma URL pública temporária, funcionando independente de rede. É mais lento que o LAN, mas resolve o problema de redes diferentes.

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
- **Notificações locais** — lembrete diário no horário de cada medicamento
- **Cadastro de medicamentos** — formulário completo com ícone, horário, instruções e modo escuro
- **Pull-to-refresh** nas telas principais
- **Modo escuro** com alternância manual e respeito à preferência do sistema

---

## Estrutura do projeto

```
takere-interface/
├── App.tsx                         # Ponto de entrada + navegação + guard de auth
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Tela principal (medicamentos de hoje)
│   │   ├── HistoryScreen.tsx       # Histórico semanal de aderência
│   │   ├── LoginScreen.tsx         # Tela de login
│   │   └── AddMedicationScreen.tsx # Formulário de cadastro de medicamento
│   ├── components/
│   │   ├── MedicationCard.tsx      # Card expansível de medicamento
│   │   ├── DaySummary.tsx          # Resumo do dia (stats + barra de progresso)
│   │   ├── WeekCalendar.tsx        # Calendário semanal com barras de aderência
│   │   ├── SectionHeader.tsx       # Cabeçalho de período (Manhã/Tarde/Noite)
│   │   └── UndoSnackbar.tsx        # Snackbar com ação de desfazer
│   ├── context/
│   │   ├── AuthContext.tsx         # Estado de autenticação (token, user, login, logout)
│   │   └── ThemeContext.tsx        # Tema claro/escuro com alternância e persistência
│   ├── services/
│   │   ├── api.ts                  # Cliente HTTP centralizado (fetch + JWT)
│   │   └── notifications.ts        # Agendamento e cancelamento de notificações locais
│   ├── data/
│   │   ├── medications.ts          # Tipos TypeScript (Medication, MedicationStatus)
│   │   └── history.ts              # Tipos + funções de cálculo de aderência
│   └── theme/
│       └── index.ts                # Paletas claro/escuro, espaçamentos, tipografia
├── assets/
├── app.json                        # Configuração Expo
└── tsconfig.json
```

---

## Tecnologias

- [Expo](https://expo.dev/) v54 — framework React Native
- [React Navigation](https://reactnavigation.org/) — navegação (bottom tabs + native stack)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — persistência do token JWT e preferências
- [Expo Vector Icons](https://icons.expo.fyi/) — ícones Ionicons
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — notificações locais
- [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) — seletor de horário nativo
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

### Fase 3 — Funcionalidades adicionais ✅
- [x] Notificações locais com `expo-notifications`
- [x] Tela de cadastro de novos medicamentos
- [x] Pull-to-refresh nas telas
- [x] Modo escuro

### Fase 4 — Acessibilidade e usabilidade ✅
> Foco: tornar o app fácil de usar para pessoas idosas, com ações claras e feedback imediato.

- [x] Tamanho de fonte ajustável (pequeno / médio / grande) salvo nas preferências
- [x] Botão "Marcar como tomado" visível no card sem precisar expandir
- [x] Vibração ao marcar medicamento como tomado (`expo-haptics`)
- [x] Tela de detalhes do medicamento — substitui o card expansível, com texto maior e mais espaço
- [x] Confirmação antes de desfazer o registro de tomada

### Fase 5 — Engajamento e rotina
> Foco: criar hábito diário e motivar o uso contínuo ao longo do tempo.

- [ ] Sequência de dias (streak) — dias consecutivos com aderência ≥ 80%
- [ ] Mensagens motivacionais personalizadas baseadas no histórico de aderência
- [ ] Tela de relatório mensal — aderência por semana, visualização em barras
- [ ] Resumo semanal via notificação push (todo domingo à noite)

### Fase 6 — Gestão completa de medicamentos
> Foco: ciclo de vida completo — criar, editar e arquivar medicamentos.

- [ ] Editar medicamento existente (reaproveita o formulário de cadastro)
- [ ] Desativar / arquivar medicamento sem excluir o histórico
- [ ] Reagendamento automático de notificações ao alterar horário
- [ ] Tela "Meus medicamentos" — lista de todos os cadastrados, ativos e arquivados

### Fase 7 — Exportação e segurança
> Foco: confiabilidade para uso médico real — compartilhar dados com médicos e proteger o acesso.

- [ ] Exportar histórico como PDF ou CSV (`expo-print` + `expo-sharing`)
- [ ] Acesso por biometria ou PIN — dispensa email/senha no dia a dia (`expo-local-authentication`)
- [ ] Backup e restauração manual dos dados (exportar/importar JSON)
