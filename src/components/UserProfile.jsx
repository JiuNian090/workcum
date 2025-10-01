import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Fab, Menu, MenuItem, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { AccountCircle, Sync, Person, ExitToApp, CloudUpload } from '@mui/icons-material';
import { fetchDataFromSupabase, syncDataToSupabase } from '../services/dataSync';
import { supabase } from '../supabaseClient';

const UserProfile = () => {
  const { user, signOut, signIn, signUp } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 新增确认密码状态
  const [username, setUsername] = useState(user?.user_metadata?.full_name || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 密码强度状态
  const [passwordFeedback, setPasswordFeedback] = useState([]); // 密码反馈信息
  const fileInputRef = useRef(null);

  // 检查密码强度的函数
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let strength = 0;

    // 长度检查
    if (password.length >= 8) {
      strength += 1;
    } else {
      feedback.push('密码至少需要8个字符');
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('密码应包含至少一个大写字母');
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('密码应包含至少一个小写字母');
    }

    // 包含数字
    if (/\d/.test(password)) {
      strength += 1;
    } else {
      feedback.push('密码应包含至少一个数字');
    }

    // 包含特殊字符
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('密码应包含至少一个特殊字符');
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
    return strength;
  };

  // 获取密码强度显示颜色
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'error';
    if (passwordStrength <= 3) return 'warning';
    return 'success';
  };

  // 获取密码强度文本
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return '弱';
    if (passwordStrength <= 3) return '中等';
    return '强';
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoginClick = () => {
    handleClose();
    setOpenLogin(true);
  };

  const handleProfileClick = () => {
    handleClose();
    setOpenProfile(true);
    setUsername(user?.user_metadata?.full_name || '');
  };

  const handleUploadClick = async () => {
    handleClose();
    if (!user) return;
    
    try {
      // 获取本地数据
      const data = {
        timeEntries: JSON.parse(localStorage.getItem('timeEntries') || '[]'),
        schedules: JSON.parse(localStorage.getItem('schedules') || '[]'),
        customShifts: JSON.parse(localStorage.getItem('customShifts') || '[]')
      };
      
      // 上传到云端
      const result = await syncDataToSupabase(user.id, data);
      
      if (result.success) {
        alert('数据上传成功！');
      } else {
        alert('数据上传失败：' + result.error.message);
      }
    } catch (error) {
      console.error('数据上传失败:', error);
      alert('数据上传失败，请重试');
    }
  };

  const handleSyncClick = async () => {
    handleClose();
    if (!user) return;
    
    // 确认是否要覆盖本地数据
    if (!window.confirm('此操作将从云端下载数据并覆盖本地数据，是否继续？')) {
      return;
    }
    
    try {
      // 从云端获取数据
      const result = await fetchDataFromSupabase(user.id);
      if (result.success) {
        if (result.data.time_entries) {
          localStorage.setItem('timeEntries', JSON.stringify(result.data.time_entries));
        }
        if (result.data.schedules) {
          localStorage.setItem('schedules', JSON.stringify(result.data.schedules));
        }
        if (result.data.custom_shifts) {
          localStorage.setItem('customShifts', JSON.stringify(result.data.custom_shifts));
        }
        // 触发storage事件以通知其他组件更新
        window.dispatchEvent(new Event('storage'));
        alert('数据同步成功！');
        // 刷新页面以反映更改
        window.location.reload();
      } else {
        alert('数据同步失败：' + result.error.message);
      }
    } catch (error) {
      console.error('数据同步失败:', error);
      alert('数据同步失败，请重试');
    }
  };

  const handleLogoutClick = async () => {
    handleClose();
    await signOut();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegister) {
        // 注册时检查密码强度
        if (passwordStrength < 3) {
          setError('密码强度不足，请按照提示改善密码安全性');
          setLoading(false);
          return;
        }
        
        // 检查密码确认
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        
        await signUp(email, password, { full_name: username });
      } else {
        await signIn(email, password);
      }
      setOpenLogin(false);
      setEmail('');
      setPassword('');
      setConfirmPassword(''); // 清空确认密码
      setUsername('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // 准备要更新的用户元数据
      const updates = {
        data: {
          full_name: username,
          avatar_url: avatarPreview || user?.user_metadata?.avatar_url || null
        }
      };
  
      // 调用Supabase API更新用户资料
      const { data, error } = await supabase.auth.updateUser(updates);
  
      if (error) {
        throw error;
      }
  
      // 更新成功提示
      alert('个人资料保存成功！');
      setOpenProfile(false);
    } catch (error) {
      console.error('保存个人资料失败:', error);
      alert('保存个人资料失败：' + error.message);
    }
  };

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return null;
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Fab 
          color="primary" 
          aria-label="user profile"
          onClick={handleClick}
          size="small"
          sx={{ 
            width: 44, 
            height: 44,
            minHeight: 44,
            backgroundColor: '#f0f0f0',
            color: '#333',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5',
            '&:hover': {
              backgroundColor: '#e5e5e5',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }
          }}
        >
          {user ? (
            getAvatarSrc() ? (
              <Avatar 
                src={getAvatarSrc()} 
                sx={{ width: 42, height: 42 }}
              />
            ) : (
              <AccountCircle sx={{ fontSize: 32 }} />
            )
          ) : (
            <AccountCircle sx={{ fontSize: 32 }} />
          )}
        </Fab>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            borderRadius: '10px',
            marginTop: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5'
          }
        }}
      >
        {!user ? (
          <MenuItem 
            onClick={handleLoginClick}
            sx={{
              py: 1.5,
              px: 2,
              fontSize: '15px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} />
            登录/注册
          </MenuItem>
        ) : (
          <>
            <MenuItem 
              onClick={handleProfileClick}
              sx={{
                py: 1.5,
                px: 2,
                fontSize: '15px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <Person sx={{ mr: 1.5, fontSize: 20 }} />
              个人资料
            </MenuItem>
            <MenuItem 
              onClick={handleUploadClick}
              sx={{
                py: 1.5,
                px: 2,
                fontSize: '15px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <CloudUpload sx={{ mr: 1.5, fontSize: 20 }} />
              上传数据
            </MenuItem>
            <MenuItem 
              onClick={handleSyncClick}
              sx={{
                py: 1.5,
                px: 2,
                fontSize: '15px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <Sync sx={{ mr: 1.5, fontSize: 20 }} />
              同步数据
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleLogoutClick}
              sx={{
                py: 1.5,
                px: 2,
                fontSize: '15px',
                fontWeight: 500,
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <ExitToApp sx={{ mr: 1.5, fontSize: 20 }} />
              退出登录
            </MenuItem>
          </>
        )}
      </Menu>

      {/* 登录/注册对话框 */}
      <Dialog 
        open={openLogin} 
        onClose={() => setOpenLogin(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle 
          style={{
            textAlign: 'center',
            paddingBottom: '8px',
            paddingTop: '24px',
            fontWeight: '600',
            fontSize: '1.5rem',
            color: '#333'
          }}
        >
          {isRegister ? '创建账户' : '欢迎回来'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleLoginSubmit} className="mt-2">
            {isRegister && (
              <TextField
                autoFocus
                margin="normal"
                label="用户名"
                type="text"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                className="mb-4"
                InputProps={{
                  style: {
                    borderRadius: '8px',
                  }
                }}
              />
            )}
            <TextField
              autoFocus={!isRegister}
              margin="normal"
              label="邮箱地址"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              className="mb-4"
              InputProps={{
                style: {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              margin="normal"
              label="密码"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (isRegister) {
                  checkPasswordStrength(e.target.value);
                }
              }}
              variant="outlined"
              className="mb-2"
              InputProps={{
                style: {
                  borderRadius: '8px',
                }
              }}
            />
            
            {/* 密码强度指示器 */}
            {isRegister && password && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    密码强度:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={getPasswordStrengthColor()}
                    fontWeight="bold"
                  >
                    {getPasswordStrengthText()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  {[...Array(5)].map((_, i) => (
                    <Box 
                      key={i}
                      sx={{ 
                        flex: 1, 
                        backgroundColor: i < passwordStrength ? 
                          (passwordStrength <= 2 ? '#f44336' : 
                           passwordStrength <= 3 ? '#ff9800' : '#4caf50') : 
                          '#e0e0e0',
                        mr: 0.5
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* 密码安全性提示 */}
            {isRegister && password && passwordFeedback.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  密码安全性提示:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {passwordFeedback.map((item, index) => (
                    <li key={index} style={{ fontSize: '0.8rem', color: '#f44336' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </Box>
            )}
            
            {/* 确认密码字段 */}
            {isRegister && (
              <TextField
                margin="normal"
                label="确认密码"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                className="mb-2"
                InputProps={{
                  style: {
                    borderRadius: '8px',
                  }
                }}
              />
            )}
            
            {error && (
              <div 
                className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm"
                style={{
                  border: '1px solid #fecaca'
                }}
              >
                {error}
              </div>
            )}
            
            {!isRegister && (
              <div className="text-right mt-1">
                <a 
                  href="#" 
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                  style={{ textDecoration: 'none' }}
                >
                  忘记密码？
                </a>
              </div>
            )}
          </form>
        </DialogContent>
        <DialogActions 
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Button 
            onClick={handleLoginSubmit} 
            variant="contained" 
            fullWidth
            disabled={loading}
            style={{
              marginBottom: '12px',
              padding: '10px',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#4f46e5',
              color: 'white',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            {loading ? (
              <span>处理中...</span>
            ) : (
              <span>{isRegister ? '创建账户' : '登录'}</span>
            )}
          </Button>
          
          <div className="w-full text-center text-sm text-gray-600">
            {isRegister ? '已有账户？' : '还没有账户？'}
            <Button 
              onClick={() => {
                setIsRegister(!isRegister);
                // 切换时重置密码相关状态
                if (!isRegister) {
                  setPassword('');
                  setConfirmPassword('');
                  setPasswordStrength(0);
                  setPasswordFeedback([]);
                }
              }}
              style={{
                textTransform: 'none',
                minWidth: 'auto',
                padding: '0',
                marginLeft: '4px',
                color: '#4f46e5',
                fontWeight: '600'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              {isRegister ? '立即登录' : '注册账户'}
            </Button>
          </div>
          
          <Button 
            onClick={() => setOpenLogin(false)}
            style={{
              marginTop: '16px',
              textTransform: 'none',
              color: '#6b7280',
              fontWeight: '500'
            }}
          >
            取消
          </Button>
        </DialogActions>
      </Dialog>

      {/* 个人资料对话框 */}
      <Dialog 
        open={openProfile} 
        onClose={() => setOpenProfile(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle 
          style={{
            textAlign: 'center',
            paddingBottom: '16px',
            paddingTop: '24px',
            fontWeight: '600',
            fontSize: '1.5rem',
            color: '#333'
          }}
        >
          个人资料
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center py-4">
            <div 
              className="relative mb-4"
              style={{
                cursor: 'pointer',
                borderRadius: '50%',
                padding: '4px',
                background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
              }}
              onClick={handleAvatarClick}
            >
              <Avatar 
                src={getAvatarSrc()} 
                sx={{ 
                  width: 80, 
                  height: 80,
                  cursor: 'pointer',
                  border: '3px solid white',
                  backgroundColor: '#f0f0f0',
                  color: '#333'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: '#4f46e5',
                  borderRadius: '50%',
                  padding: '4px',
                  border: '2px solid white'
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <TextField
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                style: {
                  borderRadius: '8px',
                }
              }}
            />
          </div>
        </DialogContent>
        <DialogActions 
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Button 
            onClick={handleSaveProfile} 
            variant="contained" 
            fullWidth
            style={{
              marginBottom: '12px',
              padding: '10px',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#4f46e5',
              color: 'white',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            保存更改
          </Button>
          
          <Button 
            onClick={() => setOpenProfile(false)}
            style={{
              textTransform: 'none',
              color: '#6b7280',
              fontWeight: '500'
            }}
          >
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserProfile;