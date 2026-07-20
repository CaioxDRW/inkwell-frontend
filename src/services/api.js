const API_URL = '/api-proxy/api.php';
const LOGIN_URL = '/api-proxy/login.php';
const REGISTER_URL = '/api-proxy/register.php';

// Função auxiliar para tentar pegar o ID do usuário localmente
const getFallbackUserId = () => {
  const storedUser = localStorage.getItem('inkwell_user') || localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return parsed.id || parsed.user_id || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const fetchOptions = (method, body = null) => {
  if (body && !body.user_id) {
    const fallbackId = getFallbackUserId();
    if (fallbackId) body.user_id = fallbackId;
  }

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

const safeFetch = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
} catch (jsonError) {
  console.log("CONTEÚDO RECEBIDO DO SERVIDOR:", text); // <-- Adicione este log
  console.error('Resposta do PHP não é JSON válido:', text);
  throw new Error('O servidor respondeu em formato inválido. Tente recarregar.');
}
    }

    if (!response.ok) {
      const message = data && typeof data === 'object' && (data.error || data.message)
        ? data.error || data.message
        : `Erro na requisição (${response.status})`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error('Erro em safeFetch:', error);
    const message = error instanceof TypeError
      ? 'Falha de comunicação com o servidor. Verifique se o backend está rodando.'
      : error.message;
    throw new Error(message || 'Erro desconhecido na comunicação com o servidor.');
  }
};

const normalizeAuthResponse = (data) => {
  if (!data || typeof data !== 'object') {
    return { raw: data, user: null };
  }

  // Captura o usuário independentemente de como o PHP o devolva
  const user = data.user ?? data.data?.user ?? data.data ?? (data.id ? data : null);
  
  return {
    raw: data,
    user: typeof user === 'object' && user !== null ? user : null
  };
};

// ==================== SERVIÇOS DE AUTENTICAÇÃO ====================
export const authService = {
  login: async (email, password) => {
    const data = await safeFetch(LOGIN_URL, fetchOptions('POST', { email, password }));
    const result = normalizeAuthResponse(data);
    
    if (!result.user) {
      throw new Error(data?.error || 'Dados de usuário ausentes na resposta do servidor.');
    }
    
    return result;
  },

  register: async (name, email, password) => {
    const data = await safeFetch(REGISTER_URL, fetchOptions('POST', { name, email, password }));
    const result = normalizeAuthResponse(data);
    
    if (!result.user) {
      throw new Error(data?.error || 'Não foi possível confirmar o cadastro do usuário.');
    }

    return result;
  }
};

// ==================== SERVIÇOS DE PASTAS ====================
export const folderService = {
  getFolders: async () => {
    try {
      const userId = getFallbackUserId();
      const url = userId
        ? `${API_URL}?action=get_folders&user_id=${userId}`
        : `${API_URL}?action=get_folders`;
      const data = await safeFetch(url, fetchOptions('GET'));
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('folderService.getFolders error:', error);
      return [];
    }
  },

  createFolder: async (folderData) => {
    return safeFetch(API_URL, fetchOptions('POST', {
      action: 'create_folder',
      name: folderData.name,
      bio: folderData.bio,
      coverUrl: folderData.coverUrl
    }));
  },

  updateFolder: async (folderId, folderData) => {
    return safeFetch(API_URL, fetchOptions('POST', {
      action: 'update_folder',
      folder_id: folderId,
      name: folderData.name,
      bio: folderData.bio,
      coverUrl: folderData.coverUrl
    }));
  },

  deleteFolder: async (folderId) => {
    return safeFetch(API_URL, fetchOptions('POST', {
      action: 'delete_folder',
      folder_id: folderId
    }));
  },

  toggleItem: async (folderId, item) => {
    return safeFetch(API_URL, fetchOptions('POST', {
      action: 'toggle_folder_item',
      folder_id: folderId,
      item_id: item.uId,
      image_url: item.img
    }));
  }
};

// ==================== SERVIÇOS DE FAVORITOS ====================
export const favoriteService = {
  getFavorites: async () => {
    try {
      const userId = getFallbackUserId();
      const url = userId
        ? `${API_URL}?action=get_favorites&user_id=${userId}`
        : `${API_URL}?action=get_favorites`;
      const data = await safeFetch(url, fetchOptions('GET'));
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('favoriteService.getFavorites error:', error);
      return [];
    }
  },

  toggleFavorite: async (item) => {
    return safeFetch(API_URL, fetchOptions('POST', {
      action: 'toggle_favorite',
      item_id: item.uId,
      image_url: item.img
    }));
  }
};