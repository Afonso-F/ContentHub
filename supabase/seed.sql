-- Dados de exemplo para desenvolvimento local
-- Este ficheiro é carregado automaticamente pelo `supabase db reset`

-- ============================================================
-- AVATARES (10 personas com imagens)
-- ============================================================
INSERT INTO avatares (id, nome, nicho, emoji, prompt_base, plataformas, imagem_url, categorias, imagens_referencia, ativo) VALUES

('a1000000-0000-0000-0000-000000000001',
 'Sofia Martins', 'Fitness & Lifestyle', '💪',
 'Criadora de conteúdo fitness portuguesa, motivadora, partilha treinos diários, receitas saudáveis e dicas de bem-estar. Tom positivo e encorajador.',
 ARRAY['instagram','tiktok','youtube'],
 'https://i.pravatar.cc/400?img=47',
 ARRAY['SFW','Lifestyle','Fitness'],
 ARRAY['https://picsum.photos/seed/sofia1/800/600','https://picsum.photos/seed/sofia2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000002',
 'Luna Cosmos', 'Anime & Cosplay', '🌙',
 'Cosplayer e artista digital apaixonada por anime e cultura japonesa. Cria conteúdo de cosplay elaborado, reviews de anime e arte digital.',
 ARRAY['instagram','tiktok','youtube','twitch'],
 'https://i.pravatar.cc/400?img=23',
 ARRAY['Anime','Cosplay','SFW'],
 ARRAY['https://picsum.photos/seed/luna1/800/600','https://picsum.photos/seed/luna2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000003',
 'Maria Chen', 'Gastronomia', '🍜',
 'Chef amadora e food blogger que explora a fusão entre a cozinha asiática e portuguesa. Receitas fáceis, restaurantes e dicas culinárias.',
 ARRAY['instagram','tiktok','youtube'],
 'https://i.pravatar.cc/400?img=31',
 ARRAY['SFW','Lifestyle'],
 ARRAY['https://picsum.photos/seed/maria1/800/600','https://picsum.photos/seed/maria2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000004',
 'Alex Storm', 'Gaming & Tech', '🎮',
 'Gamer profissional e streamer. Reviews de jogos, gameplays ao vivo, análises de hardware e tudo sobre cultura geek.',
 ARRAY['youtube','twitch','tiktok'],
 'https://i.pravatar.cc/400?img=12',
 ARRAY['SFW','Gaming'],
 ARRAY['https://picsum.photos/seed/alex1/800/600','https://picsum.photos/seed/alex2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000005',
 'Bella Rose', 'Moda & Beleza', '🌹',
 'Influencer de moda e beleza. Partilha looks do dia, tutoriais de maquiagem, reviews de produtos e tendências de moda portuguesas e internacionais.',
 ARRAY['instagram','tiktok','youtube'],
 'https://i.pravatar.cc/400?img=56',
 ARRAY['SFW','Lifestyle','Moda'],
 ARRAY['https://picsum.photos/seed/bella1/800/600','https://picsum.photos/seed/bella2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000006',
 'Diego Santos', 'Viagens & Aventura', '✈️',
 'Viajante apaixonado que explora destinos únicos em Portugal e pelo mundo. Partilha guias de viagem, dicas de poupança e experiências culturais autênticas.',
 ARRAY['instagram','youtube','tiktok'],
 'https://i.pravatar.cc/400?img=8',
 ARRAY['SFW','Lifestyle','Viagens'],
 ARRAY['https://picsum.photos/seed/diego1/800/600','https://picsum.photos/seed/diego2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000007',
 'Nadia Noir', 'Motivação & Mindset', '🔥',
 'Coach de mindset e criadora de conteúdo motivacional. Partilha estratégias de produtividade, desenvolvimento pessoal e histórias de superação.',
 ARRAY['instagram','tiktok','youtube'],
 'https://i.pravatar.cc/400?img=44',
 ARRAY['SFW','Motivacional'],
 ARRAY['https://picsum.photos/seed/nadia1/800/600','https://picsum.photos/seed/nadia2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000008',
 'Kai Digital', 'Tecnologia & IA', '🤖',
 'Criador de conteúdo tech especializado em Inteligência Artificial, programação e o futuro digital. Explica conceitos complexos de forma simples e acessível.',
 ARRAY['youtube','tiktok','instagram'],
 'https://i.pravatar.cc/400?img=15',
 ARRAY['SFW','Tech'],
 ARRAY['https://picsum.photos/seed/kai1/800/600','https://picsum.photos/seed/kai2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000009',
 'Aria Bloom', 'Natureza & Bem-estar', '🌿',
 'Apaixonada pela natureza, yoga e vida sustentável. Partilha práticas de mindfulness, dicas eco-friendly, jardim e o equilíbrio entre natureza e tecnologia.',
 ARRAY['instagram','youtube','tiktok'],
 'https://i.pravatar.cc/400?img=39',
 ARRAY['SFW','Lifestyle','Natureza'],
 ARRAY['https://picsum.photos/seed/aria1/800/600','https://picsum.photos/seed/aria2/800/600'],
 true),

('a1000000-0000-0000-0000-000000000010',
 'Zara Luxe', 'Lifestyle Premium', '💎',
 'Criadora de conteúdo de luxo e lifestyle premium. Reviews de produtos high-end, viagens de luxo, gastronomia gourmet e dicas de investimento pessoal.',
 ARRAY['instagram','youtube','tiktok'],
 'https://i.pravatar.cc/400?img=60',
 ARRAY['SFW','Lifestyle','Moda'],
 ARRAY['https://picsum.photos/seed/zara1/800/600','https://picsum.photos/seed/zara2/800/600'],
 true);


-- ============================================================
-- CANAIS YOUTUBE (5 canais, cada um ligado a um avatar)
-- ============================================================
INSERT INTO youtube_channels (id, nome, canal_id, imagem_url, descricao, nicho, seguidores, total_views, videos_count, receita_mes, adsense_rpm, avatar_id, plataforma, ativo) VALUES

('c1000000-0000-0000-0000-000000000001',
 'FitLife Portugal', 'UCfitlife_pt',
 'https://picsum.photos/seed/fitlife/800/450',
 'Canal dedicado ao fitness, treinos em casa, nutrição e estilo de vida saudável para portugueses. Novo vídeo todas as semanas!',
 'Fitness', 48200, 2150000, 87, 1240.00, 3.50,
 'a1000000-0000-0000-0000-000000000001', 'youtube', true),

('c1000000-0000-0000-0000-000000000002',
 'Anime Universe PT', 'UCanimeuniverse_pt',
 'https://picsum.photos/seed/animept/800/450',
 'O maior canal português dedicado ao anime, manga, cosplay e cultura japonesa. Reviews, notícias e muito mais!',
 'Anime', 73500, 4800000, 142, 2100.00, 2.80,
 'a1000000-0000-0000-0000-000000000002', 'youtube', true),

('c1000000-0000-0000-0000-000000000003',
 'Tech & IA com Kai', 'UCkaidigital',
 'https://picsum.photos/seed/kaitech/800/450',
 'Exploramos o futuro da tecnologia, Inteligência Artificial e programação. Tutoriais, análises e tendências do mundo digital.',
 'Tecnologia', 31800, 980000, 56, 890.00, 4.20,
 'a1000000-0000-0000-0000-000000000008', 'youtube', true),

('c1000000-0000-0000-0000-000000000004',
 'Sabores do Mundo', 'UCsaboresmundo',
 'https://picsum.photos/seed/sabores/800/450',
 'Gastronomia sem fronteiras! Receitas de todo o mundo, restaurantes escondidos em Portugal e aventuras culinárias.',
 'Gastronomia', 22600, 650000, 68, 580.00, 2.20,
 'a1000000-0000-0000-0000-000000000003', 'youtube', true),

('c1000000-0000-0000-0000-000000000005',
 'Mundo em Mochila', 'UCmundoemochila',
 'https://picsum.photos/seed/mochila/800/450',
 'Viagens a baixo custo, guias detalhados, truques de viagem e as histórias mais incríveis de quem vive na estrada.',
 'Viagens', 56900, 3200000, 112, 1680.00, 3.10,
 'a1000000-0000-0000-0000-000000000006', 'youtube', true);


-- ============================================================
-- BIBLIOTECA DE PROMPTS (100 entradas)
-- ============================================================
INSERT INTO prompt_library (tipo, titulo, prompt, categoria, tags, imagem_url, vezes_usado) VALUES

-- LIFESTYLE (12 imagens)
('imagem','Manhã Dourada em Casa','Uma jovem mulher portuguesa acordando ao nascer do sol, luz dourada a entrar pela janela, café quente na mão, ambiente aconchegante e minimalista, fotografia editorial, tons quentes','lifestyle',ARRAY['manhã','casa','luz natural'],'https://picsum.photos/seed/p001/600/400',23),
('imagem','Piquenique no Parque','Grupo de amigos num piquenique no parque, manta xadrez no chão, frutas frescas e comida colorida, risadas e momentos descontraídos, luz de tarde de verão, estilo lifestyle editorial','lifestyle',ARRAY['amigos','natureza','verão'],'https://picsum.photos/seed/p002/600/400',15),
('imagem','Home Office Perfeito','Espaço de trabalho em casa moderno e organizado, planta verde, laptop aberto, caderno e caneta, luz natural, tons neutros e minimalistas, produtividade e bem-estar','lifestyle',ARRAY['trabalho','minimalismo','produtividade'],'https://picsum.photos/seed/p003/600/400',31),
('imagem','Tarde de Leitura','Pessoa jovem a ler um livro numa poltrona confortável, luz suave de candeeiro, xícara de chá, atmosfera íntima e serena, tons neutros quentes, fotografia de lifestyle premium','lifestyle',ARRAY['leitura','interior','relaxamento'],'https://picsum.photos/seed/p004/600/400',8),
('imagem','Passeio Urbano Chique','Mulher elegante a caminhar numa rua de Lisboa, pavimento de pedra, arquitetura tradicional ao fundo, estilo editorial de moda, luz da tarde dourada, câmera em movimento','lifestyle',ARRAY['cidade','lisboa','street style'],'https://picsum.photos/seed/p005/600/400',19),
('imagem','Spa Day em Casa','Banheira com flores e pétalas, velas aromáticas, toalhas brancas dobradas, produtos de skincare premium, atmosfera luxuosa e relaxante, tons creme e rosa suave','lifestyle',ARRAY['spa','beleza','relaxamento'],'https://picsum.photos/seed/p006/600/400',27),
('imagem','Café da Manhã Instagramável','Mesa de café da manhã impecavelmente arranjada, avocado toast, smoothie colorido, fruta fresca, louça branca, luz natural lateral, estilo Scandinavian','lifestyle',ARRAY['brunch','comida','minimalismo'],'https://picsum.photos/seed/p008/600/400',45),
('imagem','Yoga ao Ar Livre','Praticante de yoga em posição de equilíbrio num jardim verde, amanhecer rosado ao fundo, calma e foco, roupa de treino minimalista, fotografia inspiracional','lifestyle',ARRAY['yoga','natureza','bem-estar'],'https://picsum.photos/seed/p009/600/400',33),
('imagem','Jantar Romântico','Mesa de jantar elegante para dois, velas, flores, louça fina, champanhe, luz ambiente quente, ambiente de restaurante gourmet, estilo editorial sofisticado','lifestyle',ARRAY['jantar','romance','elegância'],'https://picsum.photos/seed/p010/600/400',21),
('imagem','Decoração Boho','Sala de estar com decoração boho chic, plantas suspensas, tapete de lã, almofadas coloridas, luz suave filtrada, estética vibrante e natural','lifestyle',ARRAY['decoração','boho','interior'],'https://picsum.photos/seed/p011/600/400',18),
-- FITNESS (10 imagens)
('imagem','Treino de Força','Atleta a levantar peso num ginásio moderno, iluminação dramática, foco e determinação no rosto, equipamento cromado ao fundo, fotografia de fitness motivacional, tons escuros e contrastados','fitness',ARRAY['musculação','ginásio','força'],'https://picsum.photos/seed/p013/600/400',52),
('imagem','Corrida ao Amanhecer','Runner profissional numa estrada costeira portuguesa ao amanhecer, silhueta contra o oceano e o sol nascente, paisagem dramática, movimento capturado com nitidez','fitness',ARRAY['corrida','amanhecer','exterior'],'https://picsum.photos/seed/p014/600/400',38),
('imagem','Treino em Casa HIIT','Mulher energética a fazer exercícios HIIT na sala de estar, tapete de yoga colorido, expressão de esforço e determinação, espaço organizado, luz natural','fitness',ARRAY['HIIT','casa','mulher'],'https://picsum.photos/seed/p015/600/400',29),
('imagem','Pilates Studio','Sala de pilates minimalista e luminosa, equipamento Reformer, praticante em posição de extensão, paredes brancas, tons suaves, estilo wellness premium','fitness',ARRAY['pilates','studio','wellness'],'https://picsum.photos/seed/p016/600/400',17),
('imagem','Nutrição Pós-Treino','Flat lay de refeição pós-treino: frango grelhado, arroz, legumes coloridos, batata doce, copo de proteína, fundo de madeira, fotografia de nutrição desportiva','fitness',ARRAY['nutrição','alimentação','proteína'],'https://picsum.photos/seed/p017/600/400',41),
('imagem','Alongamentos ao Pôr do Sol','Silhueta de pessoa a fazer alongamentos num terraço com vista para o mar ao pôr do sol, tons laranja e roxo, composição minimalista e poética','fitness',ARRAY['alongamento','pôr do sol','silhueta'],'https://picsum.photos/seed/p018/600/400',24),
('imagem','Grupo de Fitness Outdoor','Grupo diverso de pessoas a fazer treino funcional num parque, instrutor a motivar, sorriso e energia positiva, luz de manhã, estilo comunitário','fitness',ARRAY['grupo','outdoor','funcional'],'https://picsum.photos/seed/p019/600/400',16),
('imagem','Escalada ao Cume','Alpinista a atingir o cume de uma montanha, braços levantados em vitória, paisagem épica ao fundo, expressão de conquista, luz dourada de fim de tarde','fitness',ARRAY['motivação','conquista','montanha'],'https://picsum.photos/seed/p021/600/400',48),
('imagem','Crossfit Intenso','Atleta a fazer movimentos de crossfit num box especializado, chalk no ar, barra olímpica, intensidade e foco, fotografia de ação com velocidade de obturador rápida','fitness',ARRAY['crossfit','intensidade','ação'],'https://picsum.photos/seed/p022/600/400',22),
-- MODA (10 imagens)
('imagem','Look Casual Chique','Jovem com outfit casual chique: calças bege de linho, camisa branca oversized, sneakers brancos, acessórios minimalistas, rua de paralelepípedo ao fundo, estilo editorial','moda',ARRAY['casual','minimalismo','editorial'],'https://picsum.photos/seed/p025/600/400',37),
('imagem','Vestido de Verão Floral','Modelo com vestido floral leve ao vento, jardim florido ao fundo, tons pastel, luz natural suave, fotografia fashion luminosa e romântica, estilo boho sofisticado','moda',ARRAY['verão','floral','feminino'],'https://picsum.photos/seed/p026/600/400',43),
('imagem','Look de Escritório Moderno','Profissional com look de escritório moderno: blazer estruturado, calças wide-leg, sapatos de salto baixo, briefcase, ambiente corporativo elegante','moda',ARRAY['escritório','profissional','power dressing'],'https://picsum.photos/seed/p027/600/400',28),
('imagem','Streetwear Urban','Jovem com look streetwear: hoodie oversized, calças cargo, tênis de luxo, boné, ambiente urbano grafitado, fotografia street style autêntica','moda',ARRAY['streetwear','urban','youth culture'],'https://picsum.photos/seed/p028/600/400',31),
('imagem','Noite Elegante','Mulher elegante em vestido de cocktail num evento noturno, detalhes de bijutaria, fundo desfocado com luzes bokeh, fotografia glamorosa e sofisticada','moda',ARRAY['noite','elegância','evento'],'https://picsum.photos/seed/p029/600/400',54),
('imagem','Flat Lay Outfit do Dia','Flat lay de roupa e acessórios cuidadosamente dispostos numa superfície branca: peças de roupa dobradas, sapatos, bolsa, jóias, paleta de tons neutros','moda',ARRAY['flat lay','OOTD','produto'],'https://picsum.photos/seed/p030/600/400',39),
('imagem','Look Inverno Cashmere','Pessoa com cashmere bege e calças de lã escura, rua europeia com folhas de outono ao fundo, luz fria, tons terre, fotografia editorial de moda de inverno','moda',ARRAY['inverno','cashmere','outono'],'https://picsum.photos/seed/p031/600/400',26),
('imagem','Acessórios de Luxo','Close-up de mãos com bolsa de luxo, anel discreto, manicure perfeita, roupa de qualidade ao fundo desfocado, composição de produto fashion premium','moda',ARRAY['acessórios','luxo','close-up'],'https://picsum.photos/seed/p032/600/400',47),
('imagem','Swimwear à Beira Mar','Modelo com swimwear em pose relaxada à beira-mar, pedras da praia, água azul ao fundo, luz do mediterrâneo, fotografia de moda praia editorial','moda',ARRAY['praia','swimwear','verão'],'https://picsum.photos/seed/p033/600/400',62),
('imagem','Transição de Estação','Composição split mostrando transição outono-inverno: lado esquerdo look outono colorido, lado direito look inverno minimalista, composição criativa e editorial','moda',ARRAY['transição','outono','inverno'],'https://picsum.photos/seed/p034/600/400',19),

-- COMIDA (10 imagens)
('imagem','Bowl Asiático Colorido','Buddha bowl asiático vibrante com arroz de sushi, legumes marinados, edamame, salmão, ovo mollet e molho de sésamo, fotografia gastronómica top view, fundo de cerâmica','comida',ARRAY['asiático','bowl','healthy'],'https://picsum.photos/seed/p035/600/400',58),
('imagem','Pizza Artesanal','Pizza napolitana recém saída do forno a lenha, bordas levemente queimadas, mozzarella a derreter, manjericão fresco, tomate san marzano, composição rústica e autêntica','comida',ARRAY['pizza','italiana','artesanal'],'https://picsum.photos/seed/p036/600/400',72),
('imagem','Sobremesa Francesa','Éclair perfeita de chocolate numa pastelaria francesa, glass de chocolate brilhante, composição elegante sobre pedra de mármore, fotografia de pastelaria premium','comida',ARRAY['pastelaria','francesa','chocolate'],'https://picsum.photos/seed/p037/600/400',44),
('imagem','Mercado Local Colorido','Banca de mercado local com frutas e legumes coloridos, vendedor típico ao fundo, luz de mercado coberto, tons vibrantes e texturas variadas, fotografia documental','comida',ARRAY['mercado','frutas','local'],'https://picsum.photos/seed/p038/600/400',20),
('imagem','Cocktail Craft','Bartender a preparar cocktail craft, técnica de shaker, ingredientes frescos na barra, iluminação de bar íntima, fotografia de bebida artesanal, tons escuros e atmosféricos','comida',ARRAY['cocktail','bar','artesanal'],'https://picsum.photos/seed/p039/600/400',33),
('imagem','Brunch Completo','Mesa de brunch generosa: panquecas com fruta, ovos benedict, sumo de laranja espremido, croissants, café, flores frescas, estilo de vida saudável e abundante','comida',ARRAY['brunch','panquecas','manhã'],'https://picsum.photos/seed/p040/600/400',51),
('imagem','Sushi Premium','Seleção de nigiri e maki premium numa travessa de madeira, wasabi e gengibre dispostos com cuidado, molho de soja em recipiente de cerâmica, composição japonesa minimalista','comida',ARRAY['sushi','japonesa','premium'],'https://picsum.photos/seed/p041/600/400',65),
('imagem','Bacalhau à Portuguesa','Bacalhau à Brás num prato de cerâmica rústica, apresentação tradicional com azeitonas e salsa, mesa de madeira antiga, atmosfera de taberna portuguesa, fotografia gastronómica','comida',ARRAY['portuguesa','bacalhau','tradição'],'https://picsum.photos/seed/p042/600/400',38),
('imagem','Gelado Artesanal','Gelado artesanal em casquinha, cores vibrantes de frutas tropicais, fundo branco clean, fotografia de produto alimentar de verão, estilo fresco e alegre','comida',ARRAY['gelado','verão','artesanal'],'https://picsum.photos/seed/p043/600/400',29),
('imagem','Charcutaria Premium','Tábua de charcutaria gourmet: queijos variados, enchidos, nozes, mel, uvas, pão artesanal, disposição artística, superfície de ardósia, fotografia premium de produto','comida',ARRAY['charcutaria','queijo','gourmet'],'https://picsum.photos/seed/p044/600/400',41),

-- VIAGENS (10 imagens)
('imagem','Algarve Secreto','Praia escondida no Algarve com águas turquesas e penhascos dourados ao entardecer, pessoa solitária em contemplação, fotografia de viagem emocional e cinematográfica','viagens',ARRAY['algarve','portugal','praia'],'https://picsum.photos/seed/p045/600/400',67),
('imagem','Lisboa dos Mirantes','Vista panorâmica de Lisboa a partir do Miradouro da Graça ao pôr do sol, Tejo dourado ao fundo, arruamentos históricos, tele-objectiva, tons quentes de verão','viagens',ARRAY['lisboa','miradouro','portugal'],'https://picsum.photos/seed/p046/600/400',83),
('imagem','Douro Valley','Vinhas em terraços no Vale do Douro ao amanhecer, nevoeiro nas colinas, rio serpenteando ao fundo, composição panorâmica épica, fotografia de paisagem portuguesa','viagens',ARRAY['douro','vinho','paisagem'],'https://picsum.photos/seed/p047/600/400',55),
('imagem','Tokyo Noturno','Cruzamento de Shibuya em Tokyo à noite, multidão em movimento, luzes néon e publicidade, chuva no asfalto refletindo as luzes, estilo cyberpunk e urban photography','viagens',ARRAY['tokyo','japão','urbano'],'https://picsum.photos/seed/p048/600/400',74),
('imagem','Marrocos Colorido','Medina de Marrakech, becos labirínticos com tecidos coloridos suspensos, luz filtrada, mulher com djellaba vermelha em pose, fotografia de viagem cultural autêntica','viagens',ARRAY['marrocos','cultural','cores'],'https://picsum.photos/seed/p049/600/400',46),
('imagem','Santorini Mágico','Casas brancas com cúpulas azuis de Oia, Santorini, Grécia, ao pôr do sol, mar Egeu ao fundo, flores bougainvillea, composição de viagem icónica','viagens',ARRAY['grécia','santorini','pôr do sol'],'https://picsum.photos/seed/p050/600/400',91),
('imagem','Safari Africano','Leão macho majestoso na savana africana ao amanhecer, luz dourada de backlight, ervas altas em primeiro plano, composição wildlife impactante e dramática','viagens',ARRAY['africa','safari','wildlife'],'https://picsum.photos/seed/p051/600/400',63),
('imagem','Montanha no Inverno','Pico nevado nos Alpes com esquiador em ação, spray de neve, céu azul intenso, composição de desporto invernal e paisagem alpina espetacular','viagens',ARRAY['montanha','neve','desporto'],'https://picsum.photos/seed/p052/600/400',37),
('imagem','Aventura na Selva','Trilho de selva tropical com vegetação exuberante, raios de luz a filtrar pelo dossel de árvores, explorador com mochila, fotografia de aventura e ecoturismo','viagens',ARRAY['selva','aventura','natureza'],'https://picsum.photos/seed/p053/600/400',28),
('imagem','Nova Iorque Skyline','Skyline de Manhattan ao entardecer desde o Top of the Rock, Empire State iluminado, Hudson River ao fundo, céu cor-de-rosa e laranja, grande angular, fotografia urbana premium','viagens',ARRAY['nova iorque','skyline','eua'],'https://picsum.photos/seed/p054/600/400',77),

-- BELEZA (8 imagens)
('imagem','Maquiagem Natural','Close-up de rosto feminino com maquiagem natural impecável, pele luminosa, lábios cor-de-rosa suave, fundo branco clean, iluminação de beauty shot profissional','beleza',ARRAY['maquiagem','natural','skincare'],'https://picsum.photos/seed/p055/600/400',49),
('imagem','Skincare Routine','Flat lay de produtos de skincare premium: sérum, hidratante, contorno dos olhos, tónico, todos organizados por camadas, superfície de mármore, tons brancos e dourados','beleza',ARRAY['skincare','rotina','produto'],'https://picsum.photos/seed/p056/600/400',56),
('imagem','Tutorial Smokey Eye','Close-up de olho com maquiagem smokey eye perfeita, diferentes tons de cinzento e preto, eyeshadow artístico, pestanas delineadas, fundo preto, fotografia de beleza dramática','beleza',ARRAY['maquiagem','olhos','tutorial'],'https://picsum.photos/seed/p057/600/400',34),
('imagem','Cabelo e Brilho','Mulher com cabelo longo e brilhante ao vento, luz de estúdio que realça a textura e brilho do cabelo, fundo branco, fotografia de produto de cabelo premium','beleza',ARRAY['cabelo','brilho','produto'],'https://picsum.photos/seed/p058/600/400',42),
('imagem','Esmalte Nail Art','Close-up de mãos com nail art elaborada, padrões geométricos em cores vibrantes, fundo floral, composição artística de beleza, fotografia macro detalhada','beleza',ARRAY['unhas','nail art','criativo'],'https://picsum.photos/seed/p059/600/400',25),
('imagem','Perfume de Luxo','Frasco de perfume de luxo com luz a atravessar o líquido dourado, reflexos e refrações, fundo desfocado elegante, fotografia de produto de alta joalharia','beleza',ARRAY['perfume','luxo','produto'],'https://picsum.photos/seed/p060/600/400',38),
('imagem','Máscara Facial Spa','Mulher com máscara facial de argila, pepinos nos olhos, ambiente de spa relaxante, velas e toalha branca, expressão serena, fotografia de bem-estar e beleza','beleza',ARRAY['spa','facial','cuidado'],'https://picsum.photos/seed/p061/600/400',21),
('imagem','Lábios Perfeitos','Close-up dramático de lábios com batom vermelho perfeito, textura de luxo, skin perfeita ao redor, composição minimalista e elegante de beleza','beleza',ARRAY['lábios','batom','close-up'],'https://picsum.photos/seed/p062/600/400',60),

-- MOTIVACIONAL (8 imagens)
('imagem','Silhueta no Cume','Silhueta de pessoa no topo de uma montanha rochosa ao pôr do sol, tom épico e inspiracional, céu dramático com tons laranja e roxo, composição cinematográfica','motivacional',ARRAY['sucesso','determinação','montanha'],'https://picsum.photos/seed/p063/600/400',88),
('imagem','Citação no Quadro','Mão a escrever citação motivacional num quadro negro com giz, detalhe close-up, fundo desfocado com luz de escritório, atmosfera de aprendizagem e crescimento','motivacional',ARRAY['citação','inspiração','escrita'],'https://picsum.photos/seed/p064/600/400',71),
('imagem','Campeão na Linha de Chegada','Atleta a vencer linha de chegada com braços levantados, estádio com público, confetti a cair, expressão de pura alegria e conquista, fotografia de desporto épica','motivacional',ARRAY['vitória','desporto','conquista'],'https://picsum.photos/seed/p065/600/400',64),
('imagem','Amanhecer Novo Começo','Pessoa a observar o amanhecer de um penhasco, silhueta contra o sol nascente, mar abaixo, atmosfera de contemplação e novos começos, composição minimalista','motivacional',ARRAY['amanhecer','contemplação','esperança'],'https://picsum.photos/seed/p066/600/400',79),
('imagem','Trabalho em Equipa','Mãos de diferentes pessoas unidas no centro, fundo desfocado de ambiente de trabalho, diversidade e colaboração, fotografia de team building positiva','motivacional',ARRAY['equipa','colaboração','diversidade'],'https://picsum.photos/seed/p067/600/400',52),
('imagem','Meditação e Paz','Pessoa em meditação numa pedra ao beira-mar, posição de lótus, mar calmo ao fundo, raios de sol entre nuvens, fotografia espiritual e de bem-estar mental','motivacional',ARRAY['meditação','paz','espiritual'],'https://picsum.photos/seed/p068/600/400',46),
('imagem','Metas e Objetivos','Caderno de planeamento aberto com metas escritas, caneta de luxo, café, visão de sucesso, composição flat lay motivacional de lifestyle produtivo','motivacional',ARRAY['metas','planeamento','produtividade'],'https://picsum.photos/seed/p069/600/400',58),
('imagem','Liberdade com Confiança','Mulher jovem de braços abertos num campo aberto, vento no cabelo, horizonte infinito, expressão de liberdade total, fotografia lifestyle inspiracional','motivacional',ARRAY['liberdade','confiança','exterior'],'https://picsum.photos/seed/p070/600/400',41),

-- ANIME (6 imagens)
('imagem','Guerreira Anime','Personagem guerreira estilo anime com armadura fantástica, cabelo colorido ao vento, expressão determinada, background de batalha épica, arte digital de alta qualidade','anime',ARRAY['guerreira','fantasia','digital art'],'https://picsum.photos/seed/p071/600/400',35),
('imagem','Schoolgirl Kawaii','Personagem anime schoolgirl kawaii com uniforme japonês, olhos grandes expressivos, sakura ao fundo, estilo moe, arte digital colorida e detalhada','anime',ARRAY['kawaii','schoolgirl','sakura'],'https://picsum.photos/seed/p072/600/400',48),
('imagem','Mago Sombrio','Personagem de mago sombrio estilo anime dark fantasy, capa negra, runa mágica, olhos que brilham, cityscape destruída ao fundo, arte épica cinematográfica','anime',ARRAY['mago','dark fantasy','épico'],'https://picsum.photos/seed/p073/600/400',29),
('imagem','Idol Pop Colorido','Idol pop estilo anime em palco com luzes de concerto, roupa colorida e extravagante, pose dinâmica, fãs ao fundo, estilo J-Pop vibrante e energético','anime',ARRAY['idol','j-pop','colorido'],'https://picsum.photos/seed/p074/600/400',53),
('imagem','Samurai ao Luar','Samurai anime solitário num telhado japonês à noite, katana refletindo a lua, cerejeiras em flor, composição cinematográfica e melancólica, arte digital premium','anime',ARRAY['samurai','japão','noite'],'https://picsum.photos/seed/p075/600/400',37),
('imagem','Princesa Fada','Princesa fada com asas luminosas, jardim secreto encantado, flores bioluminescentes, paleta de cores pastel e mágica, ilustração anime fantasy detalhada','anime',ARRAY['princesa','fada','fantasia'],'https://picsum.photos/seed/p076/600/400',44),

-- NATUREZA (8 imagens)
('imagem','Cascata Escondida','Cascata impressionante num bosque verde exuberante, água cristalina, musgo nas pedras, luz filtrada pelo dossel de árvores, longa exposição, fotografia de natureza épica','natureza',ARRAY['cascata','verde','água'],'https://picsum.photos/seed/p077/600/400',62),
('imagem','Pôr do Sol no Alentejo','Planície alentejana ao pôr do sol, sobreiros silhuetados, céu em chamas com tons laranja e vermelho, textura do trigo dourado em primeiro plano, fotografia de paisagem portuguesa','natureza',ARRAY['alentejo','portugal','pôr do sol'],'https://picsum.photos/seed/p078/600/400',71),
('imagem','Borboletas no Jardim','Borboleta monarca pousada em flor silvestre, macro fotografia com fundo desfocado, cores vibrantes, detalhe das asas, composição de natureza delicada e precisa','natureza',ARRAY['borboleta','macro','flores'],'https://picsum.photos/seed/p079/600/400',34),
('imagem','Floresta de Bambu','Trilho através de floresta de bambu, luz difusa, tons de verde infinitos, perspetiva linear que guia o olhar, fotografia contemplativa estilo japonês','natureza',ARRAY['bambu','floresta','zen'],'https://picsum.photos/seed/p080/600/400',58),
('imagem','Oceano Infinito','Falésias sobre o oceano atlântico, ondas a quebrar nas rochas, spray de água, escala épica, céu com nuvens dramáticas, fotografia de paisagem costeira poderosa','natureza',ARRAY['oceano','falésia','atlântico'],'https://picsum.photos/seed/p081/600/400',43),
('imagem','Aurora Boreal','Aurora boreal verde e lilás sobre lago ártico gelado, reflexo perfeito na água, silhueta de pinheiros, fotografia de longa exposição noturna, espetáculo natural raro','natureza',ARRAY['aurora boreal','ártico','noite'],'https://picsum.photos/seed/p082/600/400',85),
('imagem','Campo de Girassóis','Campo de girassóis ao amanhecer, ponto de vista raso entre as flores, horizonte com céu dourado, composição de perspetiva dramática, fotografia de paisagem rural','natureza',ARRAY['girassóis','campo','amanhecer'],'https://picsum.photos/seed/p083/600/400',39),
('imagem','Estrelas e Via Láctea','Via Láctea sobre paisagem desértica, rochas em primeiro plano, céu cheio de estrelas, fotografia de astrofotografia com longa exposição, escala galáctica impressionante','natureza',ARRAY['estrelas','via láctea','noite'],'https://picsum.photos/seed/p084/600/400',77),

-- RETRATO (6 imagens)
('imagem','Retrato Urbano Autêntico','Retrato de mulher jovem com expressão autêntica numa rua da cidade, luz natural lateral, fundo de arquitetura desfocado, fotografia de retrato editorial contemporâneo','retrato',ARRAY['retrato','urbano','autêntico'],'https://picsum.photos/seed/p085/600/400',31),
('imagem','Estúdio Minimalista','Retrato em estúdio com fundo branco neutro, luz Rembrandt, expressão calma e confiante, fotografia de retrato clássico e atemporal, técnica de iluminação profissional','retrato',ARRAY['estúdio','iluminação','clássico'],'https://picsum.photos/seed/p086/600/400',27),
('imagem','Criança em Jogo','Criança a brincar com bolhas de sabão num jardim verde, expressão de pura alegria, luz de tarde suave, fotografia de família e infância autêntica e emocionante','retrato',ARRAY['criança','família','alegria'],'https://picsum.photos/seed/p087/600/400',44),
('imagem','Avós e Netos','Avô a ensinar neto a pescar num lago sereno, luz de tarde dourada, conexão intergeracional, fotografia de família emotiva, composição de vida rural tranquila','retrato',ARRAY['família','geração','emoção'],'https://picsum.photos/seed/p088/600/400',36),
('imagem','Artista no Trabalho','Pintor com manchas de tinta nas mãos a trabalhar numa tela grande, luz de atelier, expressão concentrada, processo criativo documentado, fotografia documental artística','retrato',ARRAY['artista','criativo','trabalho'],'https://picsum.photos/seed/p089/600/400',22),
('imagem','Músico Soul','Saxofonista a tocar numa rua de Jazz, luz de néon ao fundo, fumo no ar, expressão de entrega total à música, fotografia de concerto e cultura urbana','retrato',ARRAY['músico','jazz','urbano'],'https://picsum.photos/seed/p090/600/400',49),

-- PRODUTO (6 entradas — 3 imagem + 3 vídeo)
('imagem','Produto em Fundo Neutro','Produto premium centrado em fundo neutro liso, iluminação de 3 pontos, sombras suaves, fotografia de produto para e-commerce de alta qualidade, composição minimalista','produto',ARRAY['produto','e-commerce','minimalismo'],'https://picsum.photos/seed/p091/600/400',67),
('imagem','Lifestyle com Produto','Pessoa a usar o produto num contexto de vida real, ambiente natural e autêntico, não parece publicidade, storytelling visual, lifestyle photography com produto integrado','produto',ARRAY['lifestyle','integrado','autêntico'],'https://picsum.photos/seed/p092/600/400',82),
('imagem','Detalhe e Textura do Produto','Close-up extremo de detalhe do produto mostrando textura, qualidade de material e acabamento, macro fotografia, fundo desfocado, comunicar qualidade premium','produto',ARRAY['detalhe','macro','qualidade'],'https://picsum.photos/seed/p093/600/400',74),
('video','Unboxing Produto Premium','Vídeo de unboxing de produto premium: mãos a abrir embalagem cuidadosamente, revelar produto, close-ups de detalhes, sons de unboxing satisfatórios, luz de produto profissional, ritmo lento e deliberado','produto',ARRAY['unboxing','premium','ASMR'],NULL,58),
('video','Tutorial Uso Passo a Passo','Vídeo tutorial de uso do produto: enquadramento limpo, demonstração clara, texto explicativo em sobreposição, ritmo dinâmico, edição profissional para TikTok e Instagram Reels','produto',ARRAY['tutorial','como usar','step by step'],NULL,91),
('video','Review Honesta em Câmera','Vídeo de review honesta: criador frente à câmera, ambiente natural, falar diretamente para câmera com pontos positivos e negativos, clips do produto intercalados, edição com jump cuts','produto',ARRAY['review','honesto','talking head'],NULL,76),

-- HUMOR (5 imagens)
('imagem','Momento Cómico do Dia','Situação hilária do quotidiano capturada em imagem: expressão cómica exagerada, contexto reconhecível, composição que realça o humor, cores vibrantes, estilo para partilha viral','humor',ARRAY['comédia','quotidiano','viral'],'https://picsum.photos/seed/p097/600/400',93),
('imagem','Meme Relatable','Imagem de situação super relatable para millennials: escritório caótico, expressão de stress cómico, elementos visuais do dia-a-dia exagerados, estilo de meme visual moderno','humor',ARRAY['meme','relatable','millennials'],'https://picsum.photos/seed/p098/600/400',119),
('imagem','Gato Dramático','Gato com expressão dramática e histriónica, capturado em momento perfeito de teatralidade felina, fundo neutro, composição de animal humor que convida ao share','humor',ARRAY['gato','animal','viral'],'https://picsum.photos/seed/p099/600/400',156),
('imagem','Before After Cómico','Composição before/after cómica: lado esquerdo dramático e exagerado, lado direito realista e banal, contraste visual que provoca riso imediato, design clean para redes sociais','humor',ARRAY['before after','contraste','divertido'],'https://picsum.photos/seed/p100/600/400',87),
('imagem','Reunião Online Humor','Captura estilizada de videochamada com situações cómicas: alguém com pijama em baixo, gato a invadir, fundo absurdo, elemento de humor do trabalho remoto partilhável','humor',ARRAY['zoom','trabalho remoto','relatable'],'https://picsum.photos/seed/p101/600/400',102),

-- GERAL (completar os 100)
('imagem','Conceito Minimalista Abstrato','Composição minimalista de objetos cotidianos dispostos com precisão geométrica, paleta de cores monocromática, sombras duras e criativas, fotografia de conceito e design editorial','geral',ARRAY['minimalismo','abstrato','design'],'https://picsum.photos/seed/p102/600/400',18),
('video','Timelapse Pôr do Sol Urbano','Timelapse dramático do pôr do sol sobre a cidade, nuvens em movimento acelerado, gradiente de cores do céu, edição cinematográfica com música ambiente, conteúdo evergreen para qualquer plataforma','geral',ARRAY['timelapse','pôr do sol','cinematic'],NULL,45),
('video','Reels Motivacional 30s','Vídeo motivacional de 30 segundos para Instagram Reels: texto em sobreposição com frases impactantes, imagens de fundo inspiracionais, música energética, ritmo rápido, call-to-action no final','geral',ARRAY['reels','motivação','short form'],NULL,68),
('video','Trending Audio Lifestyle','Vídeo de lifestyle sincronizado com áudio trending no TikTok: transições no beat, clips variados de rotina diária, estética coesa, storytelling visual eficiente, formato vertical 9:16','geral',ARRAY['tiktok','trending','lifestyle'],NULL,134);
