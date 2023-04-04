
import typescript from '@rollup/plugin-typescript';
//import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import ts from 'typescript';

export default {
    input: './src/index.ts',
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    output: [
        {
            file: `${pkg.module}`,
            format: 'es',
            sourcemap: true,
        },
        {
            file: `${pkg.main}`,
            format: 'cjs',
            sourcemap: true,
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        postcss(),
        typescript({
            outDir: './dist',
            typescript: ts,
            tsconfig: 'tsconfig.json',
            exclude: [
                '**/*.spec.ts',
                '**/*.test.ts',
                '**/*.stories.ts',
                '**/*.spec.tsx',
                '**/*.test.tsx',
                '**/*.stories.tsx',
                'node_modules',
                'bower_components',
                'jspm_packages',
                'dist',
            ],
            compilerOptions: {
                sourceMap: true,
                declaration: true,
            },
        }),
        // terser({
        //     output: {
        //         comments: false,
        //     },
        // }),
    ],
};