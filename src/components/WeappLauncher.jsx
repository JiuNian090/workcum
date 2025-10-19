import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import wx from 'weixin-js-sdk';

const WeappLauncher = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  useEffect(() => {
    // 配置微信JS接口
    if (typeof wx !== 'undefined') {
      // 注意：在实际部署时，需要从服务器获取以下配置信息
      wx.config({
        debug: false, // 开启调试模式
        appId: '', // 必填，公众号的唯一标识
        timestamp: 0, // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '', // 必填，签名
        jsApiList: [], // 必填，需要使用的JS接口列表
        openTagList: ['wx-open-launch-weapp'] // 必填，需要使用的开放标签列表
      });

      wx.ready(() => {
        console.log('微信JS SDK初始化成功');
      });

      wx.error((res) => {
        console.error('微信JS SDK初始化失败', res);
      });
    }
  }, []);

  return (
    <div className="inline-flex items-center justify-center">
      <wx-open-launch-weapp
        username="gh_7700dbdc6796"
        path="pages/schedule/schedule.html"
        ref={containerRef}
        style={{ display: 'inline-block' }}
      >
        <template>
          <button 
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm"
            style={{ border: 'none', background: '#9333ea' }}
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {t('project.support.miniapp')}
          </button>
        </template>
      </wx-open-launch-weapp>
    </div>
  );
};

export default WeappLauncher;