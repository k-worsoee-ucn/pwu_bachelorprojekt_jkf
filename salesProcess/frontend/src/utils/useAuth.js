import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!user.value)
  
  const isSalesManager = computed(() => user.value?.role === 'salesManager')
  const isMarketingManager = computed(() => user.value?.role === 'marketingManager')
  const isViewer = computed(() => user.value?.role === 'viewer')

  const login = async (email, password) => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  }

  const logout = async () => {
    user.value = null
    localStorage.removeItem('user')
    
    // Clear cookie on backend
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    router.push('/login')
  }

  const initAuth = async () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        
        // Verify token is still valid by checking current user
        const response = await fetch('/api/users/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          user.value = data.user
        } else {
          // Token expired or invalid
          logout()
        }
      } catch (error) {
        logout()
      }
    }
  }
  
  // Add setUser method to update user info and localStorage
  const setUser = (newUser) => {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return {
    user: computed(() => user.value),
    isAuthenticated,
    isSalesManager,
    isMarketingManager, 
    isViewer,
    login,
    logout,
    initAuth,
    setUser
  }
}
