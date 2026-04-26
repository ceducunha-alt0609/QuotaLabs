# QuotaLab

**Laboratório de análise condominial**

PWA em HTML para apoio à gestão condominial, com foco em cota, fundos, rateios, simulações, relatórios e análise financeira.

## Arquivos principais

- `index.html` — aplicativo principal.
- `manifest.json` — configuração PWA para instalação no mobile e PC.
- `sw.js` — Service Worker para cache/offline.
- `install.js` — instalador PWA com botão automático quando o navegador permite.
- `icons/` — ícones do app.
- `splashes/` — splash screens.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste pacote para a raiz do repositório.
3. Vá em **Settings > Pages**.
4. Em **Build and deployment**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Aguarde o link ser gerado.

## Como instalar

### No PC
Abra o link do GitHub Pages pelo Chrome ou Edge e clique no ícone de instalação na barra de endereço.

### No Android
Abra pelo Chrome e toque em **Instalar app** ou **Adicionar à tela inicial**.

### No iPhone/iPad
Abra pelo Safari, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.

## Observações importantes

- A instalação PWA completa exige que o app rode por `https://`, como no GitHub Pages.
- Abrir pelo `file://` pode bloquear manifest, service worker e instalação.
- O app salva dados localmente no navegador, salvo integrações externas configuradas no próprio app.

## Versão

v1.0 — Pacote PWA final para GitHub.
