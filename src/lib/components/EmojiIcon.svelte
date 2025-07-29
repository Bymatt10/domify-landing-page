<script lang="ts">
  export let emoji: string = '🛠️';
  export let animation: string = '';
  export let hoverEffect: string = '';
  export let bgColor: string = 'bg-gradient-to-br from-gray-100 to-gray-200';
  export let size: string = 'w-20 h-20';
  export let textSize: string = 'text-4xl';
</script>

<div class="emoji-icon-container flex items-center justify-center {size} rounded-full {bgColor} shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
  <!-- Light reflection effect -->
  <div class="absolute inset-0 opacity-20 bg-white rounded-full" style="background-image: radial-gradient(circle at 30% 30%, white, transparent);"></div>

  <!-- 3D-like bottom shadow -->
  <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-black opacity-10 rounded-b-full"></div>

  <!-- Emoji with animation -->
  <span class="{textSize} {animation} {hoverEffect} transition-all duration-300 transform z-10 emoji-glow">{emoji}</span>
</div>

<style>
  .emoji-glow {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
  }

  .emoji-icon-container {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 -5px 10px rgba(0, 0, 0, 0.1);
  }

  .emoji-icon-container:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 -5px 10px rgba(0, 0, 0, 0.1);
  }
</style>
