// Metro: 3D model uzantılarını asset olarak tanı (glb/gltf)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('glb', 'gltf', 'obj', 'mtl', 'bin', 'hdr');

module.exports = config;
