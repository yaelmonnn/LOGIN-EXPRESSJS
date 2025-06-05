USE [BDYael]
GO

/****** Object:  Table [dbo].[usuario]    Script Date: 04/06/2025 08:02:44 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[usuario](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[usuario] [varchar](150) NOT NULL,
	[email] [varchar](250) NOT NULL,
	[contrase�a] [varchar](max) NOT NULL,
	[estado] [bit] NOT NULL,
	[password_reset_token] [varchar](255) NULL,
	[password_reset_expires] [datetime] NULL,
	[password_changed_at] [datetime] NULL,
	[token_version] [int] NULL,
 CONSTRAINT [PK_usuario] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[usuario] ADD  CONSTRAINT [DF_usuario_token_version]  DEFAULT ((0)) FOR [token_version]
GO


