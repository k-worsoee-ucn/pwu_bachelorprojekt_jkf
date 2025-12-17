import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)
const token = ref(localStorage.getItem('token'))

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const isSalesManager = computed(() => user.value?.role === 'salesManager')
  const isMarketingManager = computed(() => user.value?.role === 'marketingManager')
  const isViewer = computed(() => user.value?.role === 'viewer')

  const login = async (email, password) => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    user.value = data.user
    token.value = data.token

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        logout()
      }
    }
  }

  const getAuthHeader = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }
  
  // Add setUser method to update user info and localStorage
  const setUser = (newUser) => {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),

    isAuthenticated,
    isSalesManager,
    isMarketingManager, 
    isViewer,

    login,
    logout,
    initAuth,
    getAuthHeader,
    setUser
  }
}