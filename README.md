# gulp template

## 開発

`$ yarn install`  
`$ npm run dev`  

## ビルド

### stg  
`$ npm run release`  

### release  
`$ npm run release`  

## ビルド & デプロイ

デプロイ先に応じて(現状ではs3かsftp)違うので、gulpfileのタスクを見て  
ちょっと動いていたソースを改変したので動作は未検証。要注意。
必要なconfigファイルをつくってnpm scriptsでコマンドをつくる。  
いつかec2にアップするやつも作る。
