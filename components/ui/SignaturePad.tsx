
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * Props para el componente SignaturePad.
 */
interface SignaturePadProps {
    width?: number;
    height?: number;
    penColor?: string;
}

/**
 * Define los métodos que el componente SignaturePad expondrá a su componente padre a través de una ref.
 * Esto permite al padre controlar el pad de firma (limpiarlo, obtener la firma, etc.).
 */
export interface SignaturePadRef {
    /** Limpia el lienzo de la firma. */
    clear: () => void;
    /** Devuelve la firma como una cadena de datos SVG. */
    getSignatureSvg: () => string;
    /** Comprueba si el lienzo está vacío (no se ha dibujado nada). */
    isEmpty: () => boolean;
}

/**
 * Un componente de lienzo (canvas) que permite al usuario dibujar una firma.
 * Utiliza `forwardRef` para exponer métodos (como `clear` y `getSignatureSvg`) a su componente padre.
 */
const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
    function SignaturePadInner({ width = 600, height = 300, penColor = 'black' }, ref) {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [isDrawing, setIsDrawing] = useState(false);
        // Almacena los comandos de la ruta SVG para poder generar un SVG vectorial de la firma.
        const [pathData, setPathData] = useState<string[]>([]);
        const lastPoint = useRef<{ x: number, y: number } | null>(null);
        
        /**
         * Obtiene las coordenadas del evento de ratón o táctil relativas al lienzo.
         * Corrige el desalineamiento calculando el factor de escala entre el tamaño CSS y el tamaño del atributo del canvas.
         */
        const getCoordinates = (event: MouseEvent | TouchEvent): { x: number, y: number } | null => {
            if (!canvasRef.current) return null;
            
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            
            // Calcular la escala (relación entre píxeles internos y píxeles CSS visuales)
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            let clientX, clientY;

            if (event instanceof MouseEvent) {
                clientX = event.clientX;
                clientY = event.clientY;
            } else if (window.TouchEvent && event instanceof TouchEvent && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                return null;
            }

            return { 
                x: (clientX - rect.left) * scaleX, 
                y: (clientY - rect.top) * scaleY 
            };
        }

        /**
         * Inicia el proceso de dibujo cuando el usuario presiona el ratón o toca la pantalla.
         */
        const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            const coords = getCoordinates(event.nativeEvent);
            if (!coords) return;
            
            setIsDrawing(true);
            lastPoint.current = coords;
            // Inicia una nueva ruta SVG con un comando "Move To".
            setPathData(prev => [...prev, `M ${coords.x.toFixed(2)} ${coords.y.toFixed(2)}`]);
        };

        /**
         * Dibuja una línea en el lienzo a medida que el usuario mueve el ratón o el dedo.
         */
        const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            if (!isDrawing) return;
            // Prevent scrolling on touch devices while drawing
            if (event.nativeEvent instanceof TouchEvent) {
                // event.preventDefault(); // Managed by style touch-action: none
            }

            const coords = getCoordinates(event.nativeEvent);
            if (!coords || !lastPoint.current) return;
            
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.beginPath();
                    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
                    ctx.lineTo(coords.x, coords.y);
                    ctx.stroke(); // Dibuja la línea en el canvas.
                }
            }
            lastPoint.current = coords;
            // Añade un comando "Line To" a la ruta SVG.
            setPathData(prev => [...prev, `L ${coords.x.toFixed(2)} ${coords.y.toFixed(2)}`]);
        };

        /**
         * Finaliza el proceso de dibujo cuando el usuario suelta el ratón o levanta el dedo.
         */
        const stopDrawing = () => {
            setIsDrawing(false);
            lastPoint.current = null;
        };
        
        /**
         * Limpia completamente el lienzo y resetea los datos de la ruta SVG.
         */
        const clearCanvas = () => {
             const canvas = canvasRef.current;
             if(canvas) {
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    ctx.clearRect(0, 0, width, height);
                }
             }
             setPathData([]);
        }

        /**
         * `useImperativeHandle` expone los métodos `clear`, `getSignatureSvg` y `isEmpty` al componente padre
         * a través de la ref que se le pasó.
         */
        useImperativeHandle(ref, () => ({
            clear: clearCanvas,
            getSignatureSvg: () => {
                if(pathData.length === 0) return '';
                const pathD = pathData.join(' ');
                // Construye y devuelve una cadena SVG completa.
                // IMPORTANTE: El viewBox coincide con las dimensiones internas para que el SVG escale correctamente.
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                    <path d="${pathD}" stroke="${penColor}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>`;
            },
            isEmpty: () => pathData.length === 0,
        }));
        
        /**
         * `useEffect` para configurar las propiedades del contexto 2D del lienzo (color, grosor, etc.).
         * Se ejecuta cuando el componente se monta y si el color del lápiz cambia.
         */
        useEffect(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    ctx.strokeStyle = penColor;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
            }
        }, [penColor]);

        return (
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="block bg-white cursor-crosshair w-full h-auto dark:border-slate-600"
                style={{ touchAction: 'none' }} // Crucial para que el scroll no interfiera en móviles
            />
        );
    }
);

export default SignaturePad;
