export const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  void main() {
    
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    
    intensity = smoothstep(0.0, 1.0, intensity);
    gl_FragColor = vec4(glowColor * intensity, intensity);
  }
`;  
