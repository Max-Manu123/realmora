import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "pt";

const STORAGE_KEY = "mapcraft_lang";

const en = {
  "brand.tagline": "Craft your world",
  "nav.features": "Features",
  "nav.how": "How it works",
  "nav.example": "Example",
  "nav.pro": "Pro",
  "nav.dashboard": "Dashboard",
  "nav.signIn": "Sign in",
  "nav.settings": "Settings",
  "nav.logout": "Log out",

  "landing.heroTitle": "Draw the world your story deserves",
  "landing.heroSubtitle":
    "MapCraft is a fast, beautiful 2D map editor for fantasy worlds, campaign regions and dungeons. Place mountains, forests, cities and roads — then share a living map with your players.",
  "landing.ctaPrimary": "Create your map",
  "landing.ctaSecondary": "Explore an example",
  "landing.howTitle": "How it works",
  "landing.how1Title": "Create a map",
  "landing.how1Body": "Start a World, Region or Dungeon in one click and name it.",
  "landing.how2Title": "Place your world",
  "landing.how2Body": "Pick a tool, click the canvas, drag things into place. Pan and zoom freely.",
  "landing.how3Title": "Add the lore",
  "landing.how3Body": "Give cities, castles and markers names and descriptions your players can read.",
  "landing.how4Title": "Share the link",
  "landing.how4Body": "Flip a map public and send a clean link. No account needed to view it.",
  "landing.featuresTitle": "Everything a game master needs",
  "landing.f1Title": "Fantasy vector art",
  "landing.f1Body": "Hand-built mountains, forests, waters, castles, walled cities and banners.",
  "landing.f2Title": "Smooth canvas",
  "landing.f2Body": "Pan, zoom and drag with precision — never lose your place.",
  "landing.f3Title": "Autosave & undo",
  "landing.f3Body": "Every change is saved for you, and every mistake can be undone.",
  "landing.f4Title": "Lore on every pin",
  "landing.f4Body": "Names and descriptions turn a drawing into a world.",
  "landing.f5Title": "Public share links",
  "landing.f5Body": "A read-only viewer your table can open on any device.",
  "landing.f6Title": "Dark & light, EN & PT",
  "landing.f6Body": "Comfortable in any room, in English or Portuguese.",
  "landing.exampleTitle": "Try it right here",
  "landing.exampleBody": "Drag to pan, scroll to zoom, click a location to read its lore.",
  "landing.useCasesTitle": "Made for",
  "landing.uc1": "Tabletop campaigns",
  "landing.uc1Body": "Hand your table a map of the realm they are about to ruin.",
  "landing.uc2": "Novel worldbuilding",
  "landing.uc2Body": "Keep your geography consistent from chapter one to the end.",
  "landing.uc3": "Game design",
  "landing.uc3Body": "Sketch overworlds and dungeon layouts before you build them.",
  "landing.uc4": "Classrooms & clubs",
  "landing.uc4Body": "Collaborative fiction that everyone can see and explore.",
  "landing.proTitle": "MapCraft Pro",
  "landing.proPrice": "$5/month",
  "landing.proBody": "Unlimited maps, private maps and HD export. Join the waitlist for launch pricing.",
  "landing.proCta": "Join the Pro waitlist",
  "footer.rights": "Built for worldbuilders.",

  "auth.title": "Welcome to MapCraft",
  "auth.login": "Log in",
  "auth.register": "Sign up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Confirm password",
  "auth.forgot": "Forgot your password?",
  "auth.forgotTitle": "Reset your password",
  "auth.sendReset": "Send reset link",
  "auth.backToLogin": "Back to log in",
  "auth.loggingIn": "Logging in...",
  "auth.creating": "Creating account...",
  "auth.checkEmail": "Check your email to confirm your account.",
  "auth.resetSent": "If that email exists, a reset link is on its way.",
  "auth.invalidEmail": "Enter a valid email address.",
  "auth.shortPassword": "Password must be at least 6 characters.",
  "auth.mismatch": "Passwords do not match.",

  "dash.title": "Your maps",
  "dash.search": "Search maps...",
  "dash.create": "Create map",
  "dash.mapsUsed": "{used}/{total} free maps used",
  "dash.empty": "No maps yet. Create your first world.",
  "dash.noResults": "No maps match that search.",
  "dash.open": "Open",
  "dash.rename": "Rename",
  "dash.delete": "Delete",
  "dash.share": "Share",
  "dash.deleteTitle": "Delete this map?",
  "dash.deleteBody": "This permanently deletes \"{name}\" and everything on it.",
  "dash.cancel": "Cancel",
  "dash.confirmDelete": "Delete map",
  "dash.newMapTitle": "Create a new map",
  "dash.mapName": "Map name",
  "dash.mapType": "Map type",
  "dash.renameTitle": "Rename map",
  "dash.save": "Save",
  "dash.limitTitle": "You have reached the free limit",
  "dash.limitBody": "Free accounts can keep 3 maps. Join the Pro waitlist for unlimited maps.",
  "dash.loading": "Loading your maps...",
  "type.World": "World",
  "type.Region": "Region",
  "type.Dungeon": "Dungeon",

  "editor.back": "Dashboard",
  "editor.saving": "Saving...",
  "editor.saved": "Saved",
  "editor.saveFailed": "Save failed",
  "editor.retry": "Retry",
  "editor.undo": "Undo",
  "editor.redo": "Redo",
  "editor.share": "Share",
  "tool.select": "Select",
  "tool.mountain": "Mountain",
  "tool.forest": "Forest",
  "tool.water": "Water",
  "tool.city": "City",
  "tool.castle": "Castle",
  "tool.road": "Road",
  "tool.marker": "Marker",
  "editor.hint": "Click the canvas to place. Drag to move. Scroll to zoom.",
  "editor.roadHint": "Click to add road points. Press Enter or Escape to finish.",
  "editor.props": "Properties",
  "editor.emptyProps": "Select something on the map to edit its name, lore and size.",
  "editor.name": "Name",
  "editor.description": "Description",
  "editor.namePlaceholder": "Eldoria",
  "editor.descPlaceholder": "A city of silver spires, ruled by the Pale Council...",
  "editor.position": "Position",
  "editor.size": "Size",
  "editor.deleteElement": "Delete element",
  "editor.zoomIn": "Zoom in",
  "editor.zoomOut": "Zoom out",
  "editor.reset": "Reset view",
  "editor.notFound": "This map could not be found.",

  "share.title": "Share this map",
  "share.public": "Public link",
  "share.publicHint": "Anyone with the link can view this map, read-only.",
  "share.copy": "Copy link",
  "share.copied": "Link copied!",
  "share.open": "Open map",
  "share.privateHint": "Turn on the public link to share this map.",

  "play.by": "A shared MapCraft world",
  "play.cta": "Create your own map",
  "play.notFound": "This map is not shared or no longer exists.",
  "play.clickHint": "Click any location to read its lore.",
  "play.noLore": "No description yet.",

  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.light": "Light",
  "settings.dark": "Dark",
  "settings.system": "System",
  "settings.language": "Language",
  "settings.account": "Account",
  "settings.email": "Email",
  "settings.memberSince": "Member since",
  "settings.pro": "MapCraft Pro",

  "pro.title": "MapCraft Pro — $5/month",
  "pro.body": "We are polishing Pro. Leave your email and you will be first in line.",
  "pro.b1": "Unlimited maps",
  "pro.b2": "Private maps and password-protected links",
  "pro.b3": "HD image export",
  "pro.b4": "Priority support and early features",
  "pro.email": "Your email",
  "pro.join": "Join the waitlist",
  "pro.joining": "Joining...",
  "pro.joined": "You are on the list! We will email you at launch.",
  "pro.already": "You are already on the waitlist.",
  "common.error": "Something went wrong. Please try again.",
} as const;

export type TranslationKey = keyof typeof en;

const pt: Record<TranslationKey, string> = {
  "brand.tagline": "Crie o seu mundo",
  "nav.features": "Recursos",
  "nav.how": "Como funciona",
  "nav.example": "Exemplo",
  "nav.pro": "Pro",
  "nav.dashboard": "Painel",
  "nav.signIn": "Entrar",
  "nav.settings": "Configurações",
  "nav.logout": "Sair",

  "landing.heroTitle": "Desenhe o mundo que sua história merece",
  "landing.heroSubtitle":
    "MapCraft é um editor de mapas 2D rápido e bonito para mundos de fantasia, regiões de campanha e masmorras. Posicione montanhas, florestas, cidades e estradas — e compartilhe um mapa vivo com seus jogadores.",
  "landing.ctaPrimary": "Criar seu mapa",
  "landing.ctaSecondary": "Ver um exemplo",
  "landing.howTitle": "Como funciona",
  "landing.how1Title": "Crie um mapa",
  "landing.how1Body": "Comece um Mundo, Região ou Masmorra em um clique e dê um nome.",
  "landing.how2Title": "Monte seu mundo",
  "landing.how2Body":
    "Escolha uma ferramenta, clique na tela e arraste para posicionar. Navegue e dê zoom livremente.",
  "landing.how3Title": "Adicione a lore",
  "landing.how3Body":
    "Dê nomes e descrições a cidades, castelos e marcadores para seus jogadores lerem.",
  "landing.how4Title": "Compartilhe o link",
  "landing.how4Body": "Deixe o mapa público e envie um link limpo. Ninguém precisa de conta.",
  "landing.featuresTitle": "Tudo o que um mestre precisa",
  "landing.f1Title": "Arte vetorial de fantasia",
  "landing.f1Body": "Montanhas, florestas, águas, castelos, cidades muradas e estandartes.",
  "landing.f2Title": "Tela fluida",
  "landing.f2Body": "Navegue, dê zoom e arraste com precisão — sem nunca se perder.",
  "landing.f3Title": "Salvamento e desfazer",
  "landing.f3Body": "Tudo é salvo automaticamente e qualquer erro pode ser desfeito.",
  "landing.f4Title": "Lore em cada ponto",
  "landing.f4Body": "Nomes e descrições transformam um desenho em um mundo.",
  "landing.f5Title": "Links públicos",
  "landing.f5Body": "Um visualizador somente leitura para abrir em qualquer dispositivo.",
  "landing.f6Title": "Claro & escuro, EN & PT",
  "landing.f6Body": "Confortável em qualquer sala, em inglês ou português.",
  "landing.exampleTitle": "Experimente aqui",
  "landing.exampleBody": "Arraste para mover, role para dar zoom, clique num local para ler a lore.",
  "landing.useCasesTitle": "Feito para",
  "landing.uc1": "Campanhas de mesa",
  "landing.uc1Body": "Entregue à sua mesa o mapa do reino que eles vão destruir.",
  "landing.uc2": "Worldbuilding literário",
  "landing.uc2Body": "Mantenha sua geografia coerente do primeiro capítulo ao fim.",
  "landing.uc3": "Design de jogos",
  "landing.uc3Body": "Esboce mapas-múndi e masmorras antes de construí-los.",
  "landing.uc4": "Escolas & clubes",
  "landing.uc4Body": "Ficção colaborativa que todos podem ver e explorar.",
  "landing.proTitle": "MapCraft Pro",
  "landing.proPrice": "US$ 5/mês",
  "landing.proBody":
    "Mapas ilimitados, mapas privados e exportação em HD. Entre na lista de espera.",
  "landing.proCta": "Entrar na lista do Pro",
  "footer.rights": "Feito para criadores de mundos.",

  "auth.title": "Bem-vindo ao MapCraft",
  "auth.login": "Entrar",
  "auth.register": "Criar conta",
  "auth.email": "E-mail",
  "auth.password": "Senha",
  "auth.confirmPassword": "Confirmar senha",
  "auth.forgot": "Esqueceu a senha?",
  "auth.forgotTitle": "Redefinir sua senha",
  "auth.sendReset": "Enviar link de redefinição",
  "auth.backToLogin": "Voltar ao login",
  "auth.loggingIn": "Entrando...",
  "auth.creating": "Criando conta...",
  "auth.checkEmail": "Confira seu e-mail para confirmar a conta.",
  "auth.resetSent": "Se esse e-mail existir, o link de redefinição está a caminho.",
  "auth.invalidEmail": "Digite um e-mail válido.",
  "auth.shortPassword": "A senha precisa ter ao menos 6 caracteres.",
  "auth.mismatch": "As senhas não conferem.",

  "dash.title": "Seus mapas",
  "dash.search": "Buscar mapas...",
  "dash.create": "Criar mapa",
  "dash.mapsUsed": "{used}/{total} mapas gratuitos usados",
  "dash.empty": "Nenhum mapa ainda. Crie seu primeiro mundo.",
  "dash.noResults": "Nenhum mapa encontrado.",
  "dash.open": "Abrir",
  "dash.rename": "Renomear",
  "dash.delete": "Excluir",
  "dash.share": "Compartilhar",
  "dash.deleteTitle": "Excluir este mapa?",
  "dash.deleteBody": "Isso exclui permanentemente \"{name}\" e tudo nele.",
  "dash.cancel": "Cancelar",
  "dash.confirmDelete": "Excluir mapa",
  "dash.newMapTitle": "Criar um novo mapa",
  "dash.mapName": "Nome do mapa",
  "dash.mapType": "Tipo de mapa",
  "dash.renameTitle": "Renomear mapa",
  "dash.save": "Salvar",
  "dash.limitTitle": "Você atingiu o limite gratuito",
  "dash.limitBody":
    "Contas gratuitas mantêm 3 mapas. Entre na lista do Pro para mapas ilimitados.",
  "dash.loading": "Carregando seus mapas...",
  "type.World": "Mundo",
  "type.Region": "Região",
  "type.Dungeon": "Masmorra",

  "editor.back": "Painel",
  "editor.saving": "Salvando...",
  "editor.saved": "Salvo",
  "editor.saveFailed": "Falha ao salvar",
  "editor.retry": "Tentar de novo",
  "editor.undo": "Desfazer",
  "editor.redo": "Refazer",
  "editor.share": "Compartilhar",
  "tool.select": "Selecionar",
  "tool.mountain": "Montanha",
  "tool.forest": "Floresta",
  "tool.water": "Água",
  "tool.city": "Cidade",
  "tool.castle": "Castelo",
  "tool.road": "Estrada",
  "tool.marker": "Marcador",
  "editor.hint": "Clique na tela para posicionar. Arraste para mover. Role para dar zoom.",
  "editor.roadHint": "Clique para adicionar pontos da estrada. Enter ou Esc para terminar.",
  "editor.props": "Propriedades",
  "editor.emptyProps": "Selecione algo no mapa para editar nome, lore e tamanho.",
  "editor.name": "Nome",
  "editor.description": "Descrição",
  "editor.namePlaceholder": "Eldoria",
  "editor.descPlaceholder": "Uma cidade de torres prateadas, governada pelo Conselho Pálido...",
  "editor.position": "Posição",
  "editor.size": "Tamanho",
  "editor.deleteElement": "Excluir elemento",
  "editor.zoomIn": "Aproximar",
  "editor.zoomOut": "Afastar",
  "editor.reset": "Redefinir visão",
  "editor.notFound": "Este mapa não foi encontrado.",

  "share.title": "Compartilhar este mapa",
  "share.public": "Link público",
  "share.publicHint": "Qualquer pessoa com o link pode ver este mapa, somente leitura.",
  "share.copy": "Copiar link",
  "share.copied": "Link copiado!",
  "share.open": "Abrir mapa",
  "share.privateHint": "Ative o link público para compartilhar este mapa.",

  "play.by": "Um mundo compartilhado no MapCraft",
  "play.cta": "Crie o seu próprio mapa",
  "play.notFound": "Este mapa não está compartilhado ou não existe mais.",
  "play.clickHint": "Clique em qualquer local para ler a lore.",
  "play.noLore": "Ainda sem descrição.",

  "settings.title": "Configurações",
  "settings.appearance": "Aparência",
  "settings.theme": "Tema",
  "settings.light": "Claro",
  "settings.dark": "Escuro",
  "settings.system": "Sistema",
  "settings.language": "Idioma",
  "settings.account": "Conta",
  "settings.email": "E-mail",
  "settings.memberSince": "Membro desde",
  "settings.pro": "MapCraft Pro",

  "pro.title": "MapCraft Pro — US$ 5/mês",
  "pro.body": "Estamos finalizando o Pro. Deixe seu e-mail e será o primeiro a saber.",
  "pro.b1": "Mapas ilimitados",
  "pro.b2": "Mapas privados e links protegidos por senha",
  "pro.b3": "Exportação de imagem em HD",
  "pro.b4": "Suporte prioritário e recursos antecipados",
  "pro.email": "Seu e-mail",
  "pro.join": "Entrar na lista",
  "pro.joining": "Entrando...",
  "pro.joined": "Você está na lista! Avisaremos no lançamento.",
  "pro.already": "Você já está na lista de espera.",
  "common.error": "Algo deu errado. Tente novamente.",
};

const dictionaries: Record<Lang, Record<TranslationKey, string>> = { en, pt };

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "en" || raw === "pt") {
        setLangState(raw);
        return;
      }
      if (navigator.language?.toLowerCase().startsWith("pt")) setLangState("pt");
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let value: string = dictionaries[lang][key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replaceAll(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
