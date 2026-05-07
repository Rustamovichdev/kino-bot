CREATE TABLE channels(
   id SERIAL PRIMARY KEY,
   channel_id TEXT NOT NULL, 
   channel_name TEXT NOT NULL,
   channel_link TEXT NOT NULL,
   is_private BOOLEAN NOT NULL,
   create_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO channels(channel_id,channel_name,channel_link,is_private)
VALUES('-1003073566381','@Frontend juft-9 160 channel','https://t.me/+ZhJ57J3hwfpmNTQy',TRUE);


-- 3477873102
-- softcellchannel
-- chanallar yaratib 