<template>
  <div class="not-found">
    <canvas ref="snowCanvas" class="snow"></canvas>
    
    <div class="main-text">
      <div class="content">
        <i class="fa-solid fa-triangle-exclamation icon pulsate" aria-hidden="true"></i>
        
        <div id="error-title">
          <img src="/images/demo/NotFound.webp" alt="404错误图标" class="error-image">
        </div>
        
        <p id="error-message">{{ randomMessage }}</p>
        
        <div class="time-display">
          当前时间: 公元{{ currentDateTime }}
        </div>
        <a href="/" class="home-link">返回首页</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [
        "🐉 页面跟着哪吒去闹海了！",
        "🏮 页面去逛元宵灯会了！",
        "🧧 页面在贴春联忘回来了！",
        "🐼 页面被熊猫当竹子叼走了！",
        "☯ 页面困在太极图里了！",
        "🎎 页面跟着皮影戏巡演去了！",
        "🌕 页面陪嫦娥捣仙药去了！",
        "🎋 页面穿越回长安看花灯！",
        "🌸 页面在西湖边赏桃花呢！",
        "🏯 页面去蓬莱仙岛闭关了！",
        "🌉 页面帮牛郎搭鹊桥去了！",
        "📜 页面被孔夫子留下抄书了！",
        "🦚 页面随孔雀舞巡游云南了！",
        "🏮 页面混入天灯节飞向银河了！",
        "🦁 页面被舞狮队叼去采青了！",
        "🎎 页面在梨园客串青衣唱戏呢！",
        "🪁 页面追着纸鸢翻越秦岭了！",
        "⛩️ 页面在武当山论道忘归了！",
        "🪕 页面跟着刘三姐对山歌去了！",
        "🀄 页面被麻将牌砌成长城了！",
        "🎵 页面在周董演唱会跟着唱《青花瓷》呢！",
        "🛒 页面在直播间抢茅台呢！",
        "🚄 页面坐着复兴号高铁环游中国去了！",
        "📱 页面在微信群里抢红包呢！",
        "🌾 页面帮神农尝百草去了！",
        "🏺 页面在敦煌临摹飞天壁画呢！",
        "🎑 页面偷吃供月糕被玉兔追！",
        "🪔 页面在秦淮河放莲花灯呢！",
        "🗡️ 页面跟着荆轲刺秦王迷路了！",
        "📖 页面在岳阳楼背范仲淹名篇呢！",
        "🛶 页面被屈原拉去投粽子赛龙舟！",
        "🌾 页面帮大禹治水三过家门不入了！",
        "🎎 页面在蔚县学剪纸窗花呢！",
        "🪡 页面被蜀绣针法绕成中国结了！",
        "🪁 页面追着潍坊风筝闯进云彩里！",
        "🍶 页面在景德镇当青花瓷模特了！",
        "🎆 页面带着火把去过彝族新年了！",
        "🏮 页面混入自贡灯会扮机甲神兽！",
        "🍡 页面在冬至集市卖糖画失踪了！",
        "🥮 页面被中秋月光晒成广寒宫玉兔！",
        "🏔️ 页面在珠峰大本营堆玛尼堆呢！",
        "🌋 页面被长白山天池水怪拖下水了！",
        "🏞️ 页面在黄果树瀑布洗彩虹浴呢！",
        "🛶 页面划着独木舟穿越三峡悬棺了！",
        "🚀 页面穿着汉服登陆空间站去了！",
        "🎮 页面在敦煌和数字飞天开黑呢！",
        "🤖 页面教故宫机器人打太极拳呢！",
        "📱 页面被二维码吸进清明上河图了！",
        "🍜 页面在兰州拉面里跳毛细舞！",
        "⚔️ 页面学关羽温酒斩华雄去了！",
        "🎭 页面在鸿门宴上扮演项庄呢！",
        "🍶 页面陪李白金樽清酒斗十千呢！",
        "🍲 页面在重庆火锅的红油锅里麻辣到起飞！",
        "🍵 页面去潮汕功夫茶馆当茶宠了！",
      ],
      currentDateTime: '',
      randomMessage: '',
      particles: [],
      animationFrameId: null
    };
  },
  created() {
    this.randomMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
  },
  mounted() {
    this.initSnow();
    this.updateDateTime();
    setInterval(this.updateDateTime, 1000);
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    cancelAnimationFrame(this.animationFrameId);
  },
  methods: {
    updateDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
      this.currentDateTime = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
    },
    initSnow() {
      const canvas = this.$refs.snowCanvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.ctx = canvas.getContext('2d');
      this.createParticles();
      this.animate();
    },
    createParticles() {
      const particleCount = (window.innerWidth * window.innerHeight) / 7000;
      this.particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight,
        dx: (Math.random() * 2) - 1,
        dy: (Math.random() * 1.5) + 1.2,
        size: Math.random() * 4 + 3,
        points: 5 + Math.floor(Math.random() * 3),
        angle: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.1
      }));
    },
    drawStar(particle) {
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.angle);
      this.ctx.fillStyle = '#f6f9fa';
      
      const step = Math.PI / particle.points;
      this.ctx.beginPath();
      for(let i = 0; i < 2 * particle.points; i++){
        const radius = i % 2 === 0 ? particle.size : particle.size * 0.5;
        const x = radius * Math.cos(i * step);
        const y = radius * Math.sin(i * step);
        if(i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    },
    animate() {
      this.ctx.clearRect(0, 0, this.$refs.snowCanvas.width, this.$refs.snowCanvas.height);

      this.particles.forEach(particle => {
        particle.y += particle.dy;
        particle.x += particle.dx;
        particle.angle += particle.rotation;

        if (particle.y > this.$refs.snowCanvas.height + 100 || 
            particle.x < -100 || 
            particle.x > this.$refs.snowCanvas.width + 100) {
          particle.x = Math.random() * this.$refs.snowCanvas.width;
          particle.y = Math.random() * -this.$refs.snowCanvas.height;
        }

        this.drawStar(particle);
      });

      this.animationFrameId = requestAnimationFrame(this.animate);
    },
    handleResize() {
      const canvas = this.$refs.snowCanvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.createParticles();
    }
  }
};
</script>

<style scoped>
.not-found {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(120deg, #ff9a9e, #fad0c4, #fbc2eb, #a18cd1, #fad0c4, #ffd1ff);
  background-size: 400% 400%;
  position: relative;
  animation: gradientFlow 15s ease infinite;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.snow {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  padding: 20vh 20px 0;
  text-align: center;
  color: #5d7399;
}

.icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 2rem;
  animation: pulsate 2s ease-in-out infinite;
}

.error-image {
  max-width: 400px;
  width: 90%;
  height: auto;
  margin: 0 auto 2rem;
  display: block;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

#error-message {
  font-size: 1.2rem;
  margin: 1rem 0 2rem;
  min-height: 60px;
  font-weight: 500;
}

.time-display {
  font-size: 1rem;
  margin: 1rem 0;
}

.home-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: 1px solid var(--vp-button-brand-border);
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.home-link:hover {
  background: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
  border-color: var(--vp-button-brand-hover-border);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.home-link:active {
  transform: translateY(0);
}

@media (min-width: 769px) {
  .icon {
    font-size: 3.5rem;
  }

  .error-image {
    max-width: 500px;
  }

  #error-message {
    font-size: 1.5rem;
    margin: 1.5rem 0 2.5rem;
  }

  .time-display {
    font-size: 1.2rem;
    margin: 1.5rem 0;
  }

  .home-link {
    font-size: 1.1rem;
    padding: 12px 24px;
  }
}
@media (max-width: 768px) {
  .content {
    padding-top: 15vh;
  }
  
  .error-image {
    max-width: 300px;
  }
  
  #error-message {
    font-size: 1.1rem;
    margin: 1rem 0 2rem;
  }
}

@keyframes pulsate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>